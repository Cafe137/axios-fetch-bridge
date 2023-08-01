`axios`, a popular HTTP client, may face compatibility issues in certain environments, such as browser extensions. This is where axios-fetch-bridge steps in - it offers an adapter that allows you to use the fetch API as a solution.

## Installation

Start by installing the package via npm:

```sh
npm install axios-fetch-bridge
```

## Usage

Once installed, import the `fetchAdapter` from 'axios-fetch-bridge'. You can then pass it to the corresponding property in your HTTP client instance.

In the example below, we're using the Bee class with 'axios-fetch-bridge':

```ts
import { fetchAdapter } from 'axios-fetch-bridge'

const bee = new Bee('http://localhost:1633', { adapter: fetchAdapter })
```
