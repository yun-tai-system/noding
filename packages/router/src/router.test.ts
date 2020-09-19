import { RouterModule } from "./router.module";
import { Module, platformCore, Router } from "@noding/core";

@Module({
  providers: [],
  imports: [
    RouterModule.forRoot([
      {
        path: "/getUser",
        method: "GET",
      },
    ]),
  ],
})
export class AppModule {}

platformCore().bootstrapModule(AppModule).then(res=>{
    const router = res.injector.get(Router)
    debugger;
})