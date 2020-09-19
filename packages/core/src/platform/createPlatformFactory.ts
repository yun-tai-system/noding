
import { StaticProvider, topInjector } from '@noding/di';
import { createPlatform, getPlatform } from './createPlatform';
import { PlatformRef } from './platformRef';
import { ALLOW_MULTIPLE_PLATFORMS, PLATFORM_ID } from './tokens';
export function createPlatformFactory(
    parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null,
    name: string,
    providers: StaticProvider[] = []
): (extraProviders?: StaticProvider[]) => PlatformRef {
    return (extraProviders: StaticProvider[] = []): PlatformRef => {
        let platform = getPlatform();
        if (!platform || platform.injector.get(ALLOW_MULTIPLE_PLATFORMS, false)) {
            if (parentPlatformFactory) {
                const allProviders = providers
                    .concat(extraProviders)
                    .concat({
                        provide: PLATFORM_ID,
                        useValue: name
                    })
                parentPlatformFactory(allProviders);
            } else {
                const injectedProviders: StaticProvider[] =
                    providers
                        .concat(extraProviders)
                        .concat({
                            provide: PLATFORM_ID,
                            useValue: name
                        });
                createPlatform(topInjector.create(injectedProviders, 'platform'));
            }
        }
        return getPlatform()!;
    };
}
