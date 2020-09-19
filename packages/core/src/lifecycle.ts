import { Observable } from 'rxjs';
import { IParameterDecorator } from '@noding/decorator';
import { Injector } from '@noding/di';
import { HandlerFunc } from '@noding/router';

export interface OnInit {
	onInit(): void | Promise<void>;
}

export function isOnInit(val: any): val is OnInit {
	return val && Reflect.has(val, 'onInit');
}

export interface OnDestory {
	onDestory(): void | Promise<void>;
}
export function isOnDestory(val: any): val is OnDestory {
	return val && Reflect.has(val, 'onDestory');
}

export interface OnError {
	onError(e: Error): any | Promise<any>;
}
export function isOnError(val: any): val is OnError {
	return val && Reflect.has(val, 'onError');
}
export interface Runable {
	run<T = any>(...args: any[]): T | Promise<T | undefined> | undefined | any;
}
export function isRunable(val: any): val is Runable {
	return val && Reflect.has(val, 'run');
}

export interface CanActivate {
	canActive(injector: Injector): boolean | Promise<boolean>;
}
export function isCanActivate(val: any): val is CanActivate {
	return val && Reflect.has(val, 'canActive');
}

export abstract class ErrorFilter {
	abstract catch<T>(error: Error, injector: Injector): T;
}
export function isErrorFilter(val: any): val is ErrorFilter {
	return val && Reflect.has(val, 'catch');
}


export abstract class ErrorHandler {
	abstract handle<T>(error: Error, injector: Injector): T;
}
export function isErrorHandler(val: any): val is ErrorHandler {
	return val && Reflect.has(val, 'handle');
}

export interface NotaddInterceptor {
	intercept<T = any>(context: Injector, next: HandlerFunc): Observable<T>;
}
export function isNotaddInterceptor(val: any): val is NotaddInterceptor {
	return val && Reflect.has(val, 'intercept');
}

export interface PipeTransform<T = any, O = any> {
	transform(value: any, metadata: IParameterDecorator<any, O>): T;
}
export function isPipeTransform(val: any): val is PipeTransform {
	return val && Reflect.has(val, 'transform');
}

export interface ControllerHandler{
    (injector: Injector):Injector;
}