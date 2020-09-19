import { URLSearchParams } from "url";
export abstract class Url {
  hash: string;
  host: string;
  hostname: string;
  href: string;
  abstract toString(): string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  readonly searchParams: URLSearchParams;
  username: string;
  abstract toJSON(): string;
}
