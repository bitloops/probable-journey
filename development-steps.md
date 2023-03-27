### Source code under `lib/` folder is auto-generated based on the bl code we have written.

It contains our application and domain layers. Each application handler/use-case is injected some ports which are associated with a token. This token will be used to attach the concreted adapter.

### Every folder under `bitloops/` is a nestjs plugin, and can be assumed to be provided as a npm package.
