import { createPropertyDecorator, getINgerDecorator, Type } from '@noding/decorator';
import { Injectable, Injector, providerToStaticProvider, ProxyHandler } from '@noding/di';
import { PlainModuleRef } from '@noding/plain';
import { CURRENT } from './platform/tokens';

export const DataRangeMetadataKey = `@ganker/data-range DataRangeMetadataKey`;
export const dataRanges: any[] = [];
export interface DataRangeOptions {
	title: string;
	isDomain?: boolean;
}
export const DataRange = createPropertyDecorator<DataRangeOptions>(DataRangeMetadataKey, (it) => {
	const options = it.options;
	if (options) {
		dataRanges.push({
			title: options.title,
			tableName: it.type.name,
			columnName: it.property,
		});
	}
});
export interface DataRangeRule {
	title: string;
	handleBuilder(columnName: string, columnType: any, current: any, qb: any): void;
	handleWhere(columnType: any, current: any): any;
}

export abstract class EntityFactory<T> {
	abstract create(instnace: T | Partial<T>): Promise<T>;
}

@Injectable()
export class EntityService {
	constructor(private injector: Injector) {}
	async createType<T>(type: Type<T>, instance: any): Promise<T> {
		const nger = getINgerDecorator(type);
		await Promise.all(
			nger.properties.map(async (it) => {
				if (it.metadataKey) {
					const handler = this.injector.get<ProxyHandler>(it.metadataKey, null);
					if (handler) {
						const value = await handler.property(it, this.injector, instance);
						Reflect.set(instance as any, it.property, value);
					}
				}
			})
		);
		return instance;
	}
	async create<T>(instance: T | Partial<T>, type?: Type<T>): Promise<T> {
		if (type) {
			const injector = this.injector.create([providerToStaticProvider(type)], type.name);
			const res = injector.get<any>(type);
			Object.entries(instance as any).forEach(([key, val]) => {
				Reflect.set(res, key, val);
			});
			return this.createType(type, res);
		}
		const originType = (instance as any).constructor;
		if (originType.name === 'Object') {
			throw new Error(`create fail, please use createType method`);
		}
		if (originType) {
			return await this.createType<T>(originType, instance);
		}
		throw new Error(`create fail, please use createType method`);
	}

	createFactory<T>(type: Type<T>): EntityFactory<T> {
		const that = this;
		return {
			create(instance: T | Partial<T>) {
				return that.create<T>(instance, type);
			},
		};
	}

	/**
	 * 根据数据范围创建Where
	 * 默认创建的条件是OR的关系
	 * @param type
	 * @param where
	 */
	async createWhere<T>(type: Type<T>, where?: Object): Promise<any | any[]> {
		const current = await this.injector.get(CURRENT, null);
		if (current) {
			const nger = getINgerDecorator(type);
			let entityName: string = '';
			nger.classes.map((cls) => {
				if (cls.metadataKey.includes('EntityMetadataKey') && cls.options) {
					entityName = cls.options.name;
				}
			});
			let rangeWhere = where || {};
			const properties = nger.properties.filter((it) => it.metadataKey === DataRangeMetadataKey);
			const domianProp = properties.find((it) => it.options && it.options.isDomain);
			if (domianProp) {
				Reflect.set(rangeWhere, domianProp.property, current.domainId);
			}
			const { dataRange, isDomain, isAdmin } = current;
			const tableDataRange: any[] = Reflect.get(dataRange, entityName || type.name);
			if (isDomain || isAdmin || !tableDataRange) {
				return rangeWhere;
			}
			const plainRef = this.injector.get(PlainModuleRef);
			if (tableDataRange.length > 1) {
				const wheres: any[] = [];
				properties.forEach((prop) => {
					const propDataRange = tableDataRange.filter(
						(item: any) => item.field.name === prop.property
					);
					const handleConditions: string[] = [];
					propDataRange.forEach((range) => {
						if (!handleConditions.includes(range.condition)) {
							const connect = plainRef.create<DataRangeRule>(range.connect);
							if (connect) {
								const value = connect.handleWhere(prop.propertyType, current);
								if (value) {
									wheres.push({ ...rangeWhere, [prop.property]: value });
									handleConditions.push(range.condition);
								}
							}
						}
					});
				});
				return wheres;
			} else if (tableDataRange.length === 1) {
				properties.forEach((it: any) => {
					const propDataRange = tableDataRange.find((item: any) => item.field.name === it.property);
					if (propDataRange) {
						// if (propDataRange.user){propDataRange.connect.value = propDataRange.user}
						const connect = plainRef.create<DataRangeRule>(propDataRange.connect);
						if (connect) {
							const value = connect.handleWhere(it.propertyType, current);
							if (value) {
								return Reflect.set(rangeWhere, it.property, value);
							}
						}
					}
				});
			}
			return rangeWhere;
		}
		return where || {};
	}
}
