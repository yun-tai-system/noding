import { createServer } from "http";
import {
  APP_INITIALIZER,
  Injector,
  Module,
  platformCore,
  LAZY_MODULES,
  MAIN_PATH,
  APP_INSTALL,
  Controller, Args
} from "@noding/core";
export interface User {}
@Controller()
export abstract class UserController {
  abstract getUser(uid: number): User;
}
debugger;
import { join } from "path";
@Module({
  providers: [
    {
      provide: LAZY_MODULES,
      useValue: Promise.resolve([
        {
          path: join(__dirname, "subModule"),
          export: "SubModule",
        },
      ]),
    },
    {
      provide: APP_INSTALL,
      useValue: () => {
        console.log(`app install`);
      },
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useValue: (injector: Injector) => {
        const app = createServer((req, res) => {
          res.end(`hello noding`);
        });
        app.listen(9090);
      },
      multi: true,
    },
  ],
})
export class AppModule {}
platformCore([
  {
    provide: MAIN_PATH,
    useValue: __filename,
  },
])
  .bootstrapModule(AppModule)
  .then(() => {
    console.log(`hello noding`);
  });
