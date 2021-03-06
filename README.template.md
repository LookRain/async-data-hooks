# ⚓Async Data Hooks

A set of React custom hooks for data requesting and posting with xstate integrated, providing precise state transitions
without the risk of yielding impossible states.

## Installation

### yarn

```bash
yarn add async-data-hooks
```

or

### npm

```bash
npm install --save async-data-hooks
```

## Example usage

### `useRequest`

```tsx
import { useRequest } from 'async-data-hooks';

export const getDog = async (params?: { [x: string]: string }) => {
  const res = await getJSON<DogResponseData>(`/api/puppies?${convertToString(params)}`));
  return res.data;
};

const DogComponent = () => {
  const { matcher, data, load } = useRequest<DogResponseData>({
    name: 'cute puppies', // Optional
    requestFn: getDog, // Function that takes in offset, limit and additional params, returns a promise
  });

  return (
    <div>
      <button onClick={() => load({ color: 'brown' })}>
        Load brown dog
      </button>

      <button onClick={() => load()}>
        Load default dog
      </button>

      {matcher.requesting && <p>Loading...</p>}

      {matcher.success && <div>{JSON.stringify(data)}}
    </div>
  );
};
```

If your data is paginated, you need to handle the offset in your own component either in a state or url search param. The hook and state machine knows nothing about your current offset. Your `requestFn` need to take into consideration the offset and request the correct page.

### POST requests

```tsx
import { useRequest } from 'async-data-hooks';

const uploadCats = async (cat: Cat) => await postJSON('/api/cats', cat);

const CatsComponent = () => {
  const { matcher, data, post } = useRequest<Cat, CatResponseData>({
    name: 'upload cats', // Optional
    requestFn: uploadCats, // Function that takes the data to post, returns a promise
  });

  return (
    <div>
      <button
        onClick={() => {
          post({
            name: 'nyan cat',
            color: 'pink grey',
            description: 'omagad this cats pukes rainbows!!!',
          });
        }}
      >
        upload nyan cat
      </button>

      {matcher.requesting && <p>Uploading...</p>}

      {matcher.success && (
        <div>
          <h1>Upload success, returned data:</h1>
          {JSON.stringify(data)}
        </div>
      )}
    </div>
  );
};
```

## State Machine

Under the hood, a finite state machine determines what state data is in. You can access the state directly from `xstateNode.value`, and compare it manually, or just use the `matchState` function exposed, or use the very handy `matcher` object that contains booleans like `requesting` `success` `fail` for easy state matching.
With a state machine, all possible state transitions are pre-defined. The benefits of such approach is:

1. Impossible states are avoided automatically. For example:

   - Problem can occur when your data is loaded but the `error` object and `isError` flag are left unchanged from the last failed call. State machine only executes your side effect at the correct state and makes sure error is already cleared before it's executed, so such problem will not occur.
   - When you already fired a request but the user triggers another request before the previous one is resolved. You can try to avoid this by disabling the button, or adding a `isLoading` flag check before you execute the call, but this requires you to manage multiple flags as states, resetting them at the correct time and check them manually when needed. State machine elegantly solves this problem, it does not allow a `REQUEST` event on `FETCH_PENDING` state, so such request will not fire at all.

2. Simplified way to check data state:
   - you no longer need to manage multiple flags and checks like `!isLoading && !error && data !== null && <div>{data}</div>`. all you need is `matcher.success && <div>{data}</div>`.

<!-- ### Visualization

To visualize the statecharts in this package, refer to the `/viz`:

```bash
yarn start
```

Then go to `http://localhost:3000/?machine=requestDataMachine` or `http://localhost:3000/?machine=postDataMachine` to get an interactive visulization of the state charts. -->

### `requestDataMachine`

![image](https://user-images.githubusercontent.com/11829847/73526781-e34e8a80-444c-11ea-84ba-9779f720f02e.png)

https://xstate.js.org/viz/?gist=e7160418a7b8ef1562659a710bdf1153

As the diagram illustrates:

- the machine starts from the `Idle` state, on `REQUEST` event it will transition to `RequestPending` state invoking `requestData` service at the same time.
- if `requestData` resolves, it will send `done` event transitioning the machine to `LoadFinished.LoadSucceeded` and executes the action `updateData` to update the context
- if `requestData` fails, it will send `error` event transitioning the machine to `LoadFinished.LoadFailed` and executes the action `updateError` to update the context
- `LoadFinished` state (containing 2 sub states) allows another `REQUEST` to be sent, also executes `clearError` if it's in `LoadFailed` state


## API

{{>main}}
