# Valibot → AST → JSON Schema Mappings

Generated examples for common string validators and flags.

Run: `deno task gen-docs` to refresh this file.



## string.email



```ts
v.pipe(v.string(), v.email())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "email": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "format": "email"
}
```



## string.url



```ts
v.pipe(v.string(), v.url())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "url": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "format": "uri"
}
```



## string.uuid



```ts
v.pipe(v.string(), v.uuid())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "uuid": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "format": "uuid"
}
```



## string.ip(ipv4|ipv6)



```ts
v.pipe(v.string(), v.ip())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "ip": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "anyOf": [
    {
      "type": "string",
      "format": "ipv4"
    },
    {
      "type": "string",
      "format": "ipv6"
    }
  ]
}
```



## string.ipv4



```ts
v.pipe(v.string(), v.ipv4())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "ipv4": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "format": "ipv4"
}
```



## string.ipv6



```ts
v.pipe(v.string(), v.ipv6())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "ipv6": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "format": "ipv6"
}
```



## string.hexColor



```ts
v.pipe(v.string(), v.hexColor())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "hexColor": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^#?[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$"
}
```



## string.slug



```ts
v.pipe(v.string(), v.slug())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "slug": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
}
```



## string.digits



```ts
v.pipe(v.string(), v.digits())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "digits": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[0-9]+$"
}
```



## string.emoji



```ts
v.pipe(v.string(), v.emoji())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "emoji": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string"
}
```



## string.hexadecimal



```ts
v.pipe(v.string(), v.hexadecimal())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "hexadecimal": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[0-9A-Fa-f]+$"
}
```



## string.creditCard



```ts
v.pipe(v.string(), v.creditCard())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "creditCard": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[0-9]{12,19}$"
}
```



## string.imei



```ts
v.pipe(v.string(), v.imei())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "imei": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{15}$"
}
```



## string.mac



```ts
v.pipe(v.string(), v.mac())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "mac": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^(?:[0-9A-Fa-f]{2}([:\\-]))(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}$"
}
```



## string.mac48



```ts
v.pipe(v.string(), v.mac48())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "mac48": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^(?:[0-9A-Fa-f]{2}([:\\-]))(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}$"
}
```



## string.mac64



```ts
v.pipe(v.string(), v.mac64())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "mac64": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^(?:[0-9A-Fa-f]{2}([:\\-]))(?:[0-9A-Fa-f]{2}\\1){6}[0-9A-Fa-f]{2}$"
}
```



## string.base64



```ts
v.pipe(v.string(), v.base64())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "base64": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$"
}
```



## string.ulid



```ts
v.pipe(v.string(), v.ulid())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "ulid": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$"
}
```



## string.nanoid



```ts
v.pipe(v.string(), v.nanoid())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "nanoid": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[A-Za-z0-9_-]+$"
}
```



## string.cuid2



```ts
v.pipe(v.string(), v.cuid2())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "cuid2": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^[a-z0-9]{25}$"
}
```



## string.isoDate



```ts
v.pipe(v.string(), v.isoDate())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "isoDate": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
}
```



## string.isoDateTime



```ts
v.pipe(v.string(), v.isoDateTime())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "isoDateTime": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,9})?)?(Z|[+\\-]\\d{2}:?\\d{2})?$"
}
```



## string.isoTime



```ts
v.pipe(v.string(), v.isoTime())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "isoTime": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,9})?)?(Z|[+\\-]\\d{2}:?\\d{2})?$"
}
```



## string.isoTimeSecond



```ts
v.pipe(v.string(), v.isoTimeSecond())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "isoTimeSecond": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,9})?(Z|[+\\-]\\d{2}:?\\d{2})?$"
}
```



## string.isoTimestamp



```ts
v.pipe(v.string(), v.isoTimestamp())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "isoTimestamp": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2}(\\.\\d{1,9})?)?(Z|[+\\-]\\d{2}:?\\d{2})?$"
}
```



## string.isoWeek



```ts
v.pipe(v.string(), v.isoWeek())
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "isoWeek": true
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "pattern": "^\\d{4}-W\\d{2}(-\\d)?$"
}
```



## string.startsWith/endsWith



```ts
v.pipe(v.string(), v.startsWith("ab"), v.endsWith("yz"))
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "startsWith": "ab",
    "endsWith": "yz"
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "allOf": [
    {
      "pattern": "^ab.*"
    },
    {
      "pattern": ".*yz$"
    }
  ]
}
```



## string.min/max length



```ts
v.pipe(v.string(), v.minLength(3), v.maxLength(5))
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "minLength": 3,
    "maxLength": 5
  }
}
```



**JSON Schema**

```json
{
  "type": "string",
  "minLength": 3,
  "maxLength": 5
}
```



## string.graphemes



```ts
v.pipe(v.string(), v.minGraphemes(1), v.maxGraphemes(5))
```



**AST**

```json
{
  "kind": "schema",
  "vendor": "valibot",
  "version": 1,
  "format": 1,
  "node": {
    "type": "string",
    "minGraphemes": 1,
    "maxGraphemes": 5
  }
}
```



**JSON Schema**

```json
{
  "type": "string"
}
```
