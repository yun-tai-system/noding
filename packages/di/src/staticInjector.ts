import {
	StaticProvider,
	BaseProvider,
	ExistingProvider,
	isValueProvider,
	isExistingProvider,
	isFactoryProvider,
	isStaticClassProvider,
	ValueProvider,
	FactoryProvider,
	StaticClassProvider,
	InjectFlags,
	isConstructorProvider,
	ConstructorProvider,
	TScope,
	IToken,
} from './types';
import { stringify, catchInjectorError, staticError, resolveForwardRef, NG_TEMP_TOKEN_PATH } from './util';
import { INJECTOR, GET_INGER_DECORATOR, SKIP_MULTIS } from './tokens';
import {
	Injector,
	ProxyPropertyHandler,
	ProxyMethodParamsHandler,
	ProxyHandler,
	ProxyConstructorHandler,
} from './injector';
import { Optional, Self, SkipSelf, Host, Inject, InjectMetadataKey } from './decorator';
import { providerToStaticProvider } from './providerToStaticProvider';
import { InjectionToken } from './injectionToken';
import { setCurrentInjector } from './currentInjector';
import { getINgerDecorator, IPropertyDecorator, IParameterDecorator, IConstructorDecorator } from '@noding/decorator';
import { createProxyRef } from './proxy';

export const THROW_IF_NOT_FOUND = Symbol.for(`_THROW_IF_NOT_FOUND`);
export const IDENT = function <T>(value: T): T {
	return value;
};
const EMPTY: any = <any[]>[];
export const CIRCULAR: any = IDENT;
const NO_NEW_LINE = 'ɵ';

export type Asts = Ast | Asts[];
export abstract class Ast<O extends BaseProvider = BaseProvider, T = any> {
	value: T | undefined = EMPTY;
	asts: Ast[] = [];
	deps: any[] = [];
	get provide() {
		return this.options.provide;
	}
	get multi() {
		return !!this.options.multi;
	}
	get noCache() {
		return !!this.options.noCache;
	}
	constructor(public readonly options: O) { }
	getNger(injector: Injector) {
		return injector.get(GET_INGER_DECORATOR);
	}
	factory(injector: Injector): T | T[] {
		let instance = this.value;
		if (this.noCache) {
			if (this.multi) {
				instance = [this._factory(injector), ...this._factoryAsts(injector)] as any;
			} else {
				instance = this._factory(injector);
			}
		}
		if (instance === CIRCULAR) {
			throw Error(NO_NEW_LINE + 'Circular dependency');
		} else if (instance === EMPTY) {
			instance = CIRCULAR;
			if (this.multi) {
				instance = [this._factory(injector), ...this._factoryAsts(injector)] as any;
			} else {
				instance = this._factory(injector);
			}
		}
		this.value = instance;
		return this.value!;
	}
	abstract _factory(injector: Injector): T;
	_factoryAsts(injector: Injector): T[] {
		return this.asts.map((it) => it._factory(injector));
	}
	setMulti(ast: Asts) {
		if (Array.isArray(ast)) {
			ast.map((it) => this.setMulti(it));
		} else {
			this.asts.push(ast);
		}
	}
	buildDeps(deps: any[] = []) {
		return deps.map((it) => {
			let flags: any = InjectFlags.Default;
			if (Array.isArray(it)) {
				let token: any;
				for (let i of it) {
					if (i instanceof Optional) {
						flags = flags | InjectFlags.Optional;
					} else if (i instanceof Self) {
						flags = flags | InjectFlags.Self;
					} else if (i instanceof SkipSelf) {
						flags = flags | InjectFlags.SkipSelf;
					} else if (i instanceof Host) {
						flags = flags | InjectFlags.Host;
					} else if (i instanceof Inject) {
						token = i.options;
					} else {
						token = i;
					}
				}
				const isOptional = !!(flags & InjectFlags.Optional);
				return {
					token,
					flags,
					notfound: isOptional ? null : THROW_IF_NOT_FOUND,
				};
			} else {
				const isOptional = !!(flags & InjectFlags.Optional);
				return {
					token: it,
					flags,
					notfound: isOptional ? null : THROW_IF_NOT_FOUND,
				};
			}
		});
	}
}
export class ExistingAst<T> extends Ast<ExistingProvider, T> {
	constructor(options: ExistingProvider) {
		super(options);
	}
	_factory(injector: Injector): T {
		return injector.get<T>(this.options.useExisting);
	}
}
export class ValueAst<T = any> extends Ast<ValueProvider, T> {
	constructor(options: ValueProvider) {
		super(options);
	}
	_factory(injector: Injector) {
		return this.options.useValue;
	}
}
export class FactoryAst<T> extends Ast<FactoryProvider, T> {
	constructor(options: FactoryProvider) {
		super(options);
		this.deps = this.buildDeps(options.deps);
	}
	_factory(injector: Injector) {
		const deps = this.deps.map((it) => injector.get<any>(it.token, it.notfound, it.flags));
		return this.options.useFactory(...deps);
	}
}
export class StaticClassAst<T> extends Ast<StaticClassProvider, T> {
	constructor(options: StaticClassProvider) {
		super(options);
		this.deps = this.buildDeps(options.deps);
	}
	_factory(injector: Injector) {
		const fn = resolveForwardRef(this.options.useClass);
		const getNger = this.getNger(injector);
		const nger = getNger(fn);
		const deps = this.deps.map((it) => injector.get<any>(it.token, it.notfound, it.flags));
		const instance = new fn(...deps);
		return createProxyRef(nger, injector, instance);
	}
}
export class ConstructorAst<T> extends Ast<ConstructorProvider, T> {
	constructor(options: ConstructorProvider) {
		super(options);
		this.deps = this.buildDeps(options.deps);
	}
	_factory(injector: Injector) {
		const getNger = this.getNger(injector);
		const nger = getNger(this.options.provide);
		const deps = this.deps.map((it) => injector.get<any>(it.token, it.notfound, it.flags));
		const instance = new this.options.provide(...deps);
		return createProxyRef(nger, injector, instance);
	}
}
export class NullInjector extends Injector {
	get<T>(token: any, notFoundValue?: any, flags?: InjectFlags | undefined): T {
		if (notFoundValue === THROW_IF_NOT_FOUND) {
			const error = new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
			error.name = 'NullInjectorError';
			throw error;
		}
		return notFoundValue;
	}
	create(providers: StaticProvider[], source?: string | undefined): Injector {
		return new StaticInjector(providers, this, source);
	}
	getInjector(scope: TScope): Injector | undefined {
		if (scope === this.scope) {
			return this;
		}
		return undefined;
	}
}
export const NULL_INJECTOR = new NullInjector();
/**
 * 静态注射器
 */
export class StaticInjector extends Injector {
	public record: Map<any, Ast<any>> = new Map();
	get skips(): any[] {
		return this.get(SKIP_MULTIS, [])
	}
	constructor(providers: StaticProvider[], parent: Injector = NULL_INJECTOR, scope: TScope = null) {
		super();
		this.parent = parent;
		this.scope = scope;
		this.addProviders(providers);
	}
	addProviders(providers: StaticProvider[]) {
		const asts = providers.map((it) => {
			it.provide = resolveForwardRef(it.provide);
			const provider = providerToStaticProvider(it);
			return this._createAst(provider);
		});
		this._handlerAsts(asts);
	}
	get<T>(token: any, notfound: any = THROW_IF_NOT_FOUND, flags: InjectFlags = InjectFlags.Default): T {
		if (token === Injector || token === INJECTOR) return this as any;
		if (token === GET_INGER_DECORATOR) return getINgerDecorator as any;
		let lastInjector = setCurrentInjector(this);
		try {
			const val = this._get(token, notfound, flags, this);
			return val;
		} catch (e) {
			return catchInjectorError(e, token, 'StaticInjectorError', this.scope);
		} finally {
			setCurrentInjector(lastInjector);
		}
	}
	_get(
		token: any,
		notfound: any = THROW_IF_NOT_FOUND,
		flags: number = InjectFlags.Default,
		injector?: Injector
	): any {
		const record = this.record.get(token);
		try {
			/**
			 * 不是 skip self
			 */
			if (record && !(flags & InjectFlags.SkipSelf)) {
				return record.factory(injector || this);
			}
			/**
			 * 不是 self
			 */
			if (!(flags & InjectFlags.Self)) {
				if (this.parent) {
					if (this.parent instanceof StaticInjector) {
						return this.parent._get(token, notfound, flags, injector);
					}
					return this.parent.get(token, notfound, flags);
				}
			}
			/**
			 * 不是 optional
			 */
			if (!(flags & InjectFlags.Optional)) {
				return NULL_INJECTOR.get(token, notfound, flags);
			}
			return NULL_INJECTOR.get(token, typeof notfound !== 'undefined' ? notfound : null);
		} catch (e) {
			// ensure that 'e' is of type Error.
			if (!(e instanceof Error)) {
				e = new Error(e);
			}
			const path: any[] = (e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || []);
			const pop = path.pop();
			if (pop !== token) {
				path.unshift(token);
			}
			if (pop) path.push(pop)
			if (record && record.value == CIRCULAR) {
				record.value = EMPTY;
			}
			throw e;
		}
	}
	create(providers: StaticProvider[], source?: string): Injector {
		return new StaticInjector(providers, this, source);
	}
	getInjector(scope: TScope): Injector | undefined {
		if (this.scope === scope) {
			return this;
		}
		if (this.parent) return this.parent.getInjector(scope);
		return undefined;
	}
	private _createAst(it: StaticProvider): Asts {
		if (Array.isArray(it)) {
			return it.map((item) => this._createAst(item));
		} else {
			if (isFactoryProvider(it)) {
				return new FactoryAst(it);
			} else if (isValueProvider(it)) {
				return new ValueAst(it);
			} else if (isStaticClassProvider(it)) {
				return new StaticClassAst(it);
			} else if (isExistingProvider(it)) {
				return new ExistingAst(it);
			} else if (isConstructorProvider(it)) {
				return new ConstructorAst(it);
			} else {
				throw staticError(
					'StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
					it
				);
			}
		}
	}
	setRecord(it: Ast<any>) {
		const old = this.record.get(it.provide);
		if (it.multi) {
			if (old) {
				old.setMulti(it);
			} else {
				this.record.set(it.provide, it);
			}
		} else {
			/**
			 * 如果不存在，新增一个
			 */
			if (!old) {
				this.record.set(it.provide, it);
			}
		}
	}
	private _handlerAsts(it: Asts) {
		if (Array.isArray(it)) {
			it.map((item) => this._handlerAsts(item));
		} else {
			if (it.provide instanceof InjectionToken) {
				const options = it.provide.options;
				if (options) {
					const providedIn = options.providedIn;
					if (providedIn) {
						try {
							const injector = this.getInjector(providedIn);
							if (injector instanceof StaticInjector) {
								injector.setRecord(it);
								return;
							}
						} catch (e) {
							console.log(e.message);
						}
					}
				}
			}
			this.setRecord(it);
			return;
		}
	}
}

export const topInjector = NULL_INJECTOR.create(
	[
		{
			provide: GET_INGER_DECORATOR,
			useValue: getINgerDecorator,
		},
		{
			provide: InjectMetadataKey,
			useFactory: () => {
				const property: ProxyPropertyHandler<any, any> = (
					item: IPropertyDecorator<any, any>,
					injector: Injector
				) => {
					const token = item.options as IToken<any>;
					const old = Reflect.get(item.type.prototype, item.property)
					if (token) {
						return injector.get(token, old);
					}
					return old;
				}
				const methodParams: ProxyMethodParamsHandler<any, any> = (
					old: any,
					item: IParameterDecorator<any, any>,
					injector: Injector
				) => {
					const token = item.options as IToken<any>;
					if (token) {
						return injector.get(token, old);
					}
					return old;
				}
				const ctor: ProxyConstructorHandler<any, any> = (
					parameters: Array<any>, constructor: IConstructorDecorator<any, any>, injector: Injector
				) => {
					const token = constructor.options as IToken<any>;
					const old = Reflect.get(parameters, constructor.parameterIndex)
					if (token) {
						return injector.get<ProxyConstructorHandler<any, any>>(token, old);
					}
					return old;
				}
				return new ProxyHandler({
					property,
					methodParams,
					ctor
				});
			},
			deps: [Injector],
		},
	],
	'top'
);
