import { Injector } from '@noding/di'
import { PlatformRef } from './platformRef';
import { ALLOW_MULTIPLE_PLATFORMS } from './tokens';
let _platform: PlatformRef;
export function getPlatform(): PlatformRef | null {
    return _platform && !_platform.destroyed ? _platform : null;
}
export function createPlatform(injector: Injector): PlatformRef {
    if (_platform && !_platform.destroyed &&
        !_platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
        throw new Error('There can be only one platform. Destroy the previous one to create a new one.');
    }
    _platform = injector.get(PlatformRef);
    return _platform;
}
