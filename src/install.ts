import { Module, platformCore } from "@noding/core";

@Module()
export class InstallModule {}

platformCore().bootstrapModule(InstallModule);
