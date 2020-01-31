# `stateful-async-data-hooks`

A set of React custom hooks for data fetching and posting with xstate integrated, providing precise state transitions
without the risk of yielding impossible states.

## Example usage

### `useGet`

```tsx
import { useGet } from 'async-data-hooks';

export const getDog = async (params?: { [x: string]: string }) => {
  const res = await getJSON<DogResponseData>(`/api/puppies?${convertToString(params)}`));
  return res.data;
};

const DogComponent = () => {
  const { matcher, data, load } = useGet<DogResponseData>({
    name: 'cute puppies', // Optional
    fetchFn: getDog, // Function that takes in offset, limit and additional params, returns a promise
  });

  return (
    <div>
      <button onClick={() => load({ color: 'brown' })}>
        Load brown dog
      </button>

      <button onClick={() => load()}>
        Load default dog
      </button>

      {matcher.fetching && <p>Loading...</p>}

      {matcher.success && <div>{JSON.stringify(data)}}
    </div>
  );
};
```

If your data is paginated, you need to handle the offset in your own component either in a state or url search param. The hook and state machine knows nothing about your current offset. Your `fetchFn` need to take into consideration the offset and request the correct page.

### `usePost`

```tsx
import { usePost } from 'async-data-hooks';

const uploadCats = async (cat: Cat) => await postJSON('/api/cats', cat);

const CatsComponent = () => {
  const { matcher, data, post } = usePost<Cat, CatResponseData>({
    name: 'upload cats', // Optional
    postFn: uploadCats, // Function that takes the data to post, returns a promise
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

      {matcher.fetching && <p>Uploading...</p>}

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

## API

## Functions

<dl>
<dt><a href="#useGet">useGet(config)</a> ⇒ <code><a href="#UseGetReturnedObject">UseGetReturnedObject</a></code></dt>
<dd><p>Create hook to perform a blocking fetch request for data (You can't fetch data when a request has not been resolved or rejected).</p></dd>
<dt><a href="#usePost">usePost(config)</a> ⇒ <code><a href="#UsePostReturnedObject">UsePostReturnedObject</a></code></dt>
<dd><p>Create hook to perform a blocking fetch request for data (You can't fetch data when a request has not been resolved or rejected).</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UseGetReturnedObject">UseGetReturnedObject</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#UsePostReturnedObject">UsePostReturnedObject</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="useGet"></a>

## useGet(config) ⇒ [<code>UseGetReturnedObject</code>](#UseGetReturnedObject)

<p>Create hook to perform a blocking fetch request for data (You can't fetch data when a request has not been resolved or rejected).</p>

**Kind**: global function
**Returns**: [<code>UseGetReturnedObject</code>](#UseGetReturnedObject) - <p>returnedObject</p>

| Param  | Type                          | Description                                                                                                          |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| config | <code>useGetHookConfig</code> | <p>Config file with compulsory fetch function <code>fetchFn</code>, optional <code>name</code> for debugging and</p> |

<a name="usePost"></a>

## usePost(config) ⇒ [<code>UsePostReturnedObject</code>](#UsePostReturnedObject)

<p>Create hook to perform a blocking fetch request for data (You can't fetch data when a request has not been resolved or rejected).</p>

**Kind**: global function

| Param  | Type                          | Description                                                                                                          |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| config | <code>useGetHookConfig</code> | <p>Config file with compulsory fetch function <code>fetchFn</code>, optional <code>name</code> for debugging and</p> |

<a name="UseGetReturnedObject"></a>

## UseGetReturnedObject : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name       | Type                   | Description                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data       | <code>any</code>       | <p>xstateNode.context.data exposed for easy access to the data in the node</p>                                                                                                                                                                                               |
| error      | <code>any</code>       | <p>xstateNode.context.error exposed for easy access to the error in the node</p>                                                                                                                                                                                             |
| matcher    | <code>object</code>    | <p>object containing boolean values fetching, finished, success, fail for easy state maching</p>                                                                                                                                                                             |
| load       | <code>function</code>  | <p>exposed function for loading data</p>                                                                                                                                                                                                                                     |
| matchState | <code>function</code>  | <p>exposed <code>xstateNode.matches</code> function for matching states, use StateTypes for comparison</p>                                                                                                                                                                   |
| xstateNode | <code>StateNode</code> | <p>as the name implies, the representation of the current <code>xstate</code> state https://xstate.js.org/docs/guides/states.html#state-definition. You shouldn't need access to this object but it is still exposed in case you need advanced functionality with xstate</p> |

<a name="UsePostReturnedObject"></a>

## UsePostReturnedObject : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name       | Type                   | Description                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data       | <code>any</code>       | <p>xstateNode.context.responseData exposed for easy access to the POST request response data in the node</p>                                                                                                                                                                 |
| error      | <code>any</code>       | <p>xstateNode.context.error exposed for easy access to the error in the node</p>                                                                                                                                                                                             |
| matcher    | <code>object</code>    | <p>object containing boolean values posting, finished, success, fail for easy state maching</p>                                                                                                                                                                              |
| post       | <code>function</code>  | <p>exposed function for posting data</p>                                                                                                                                                                                                                                     |
| matchState | <code>function</code>  | <p>xstateNode.matches method exposed for easy state maching. Use StateTypes for matching</p>                                                                                                                                                                                 |
| xstateNode | <code>StateNode</code> | <p>as the name implies, the representation of the current <code>xstate</code> state https://xstate.js.org/docs/guides/states.html#state-definition. You shouldn't need access to this object but it is still exposed in case you need advanced functionality with xstate</p> |

## State Machine

Under the hood, a finite state machine determines what state data is in. You can access the state directly from `xstateNode.value`, and compare it manually, or just use the `matchState` function exposed, or use the very handy `matcher` object that contains booleans like `fetching` `success` `fail` for easy state matching.
With a state machine, all possible state transitions are pre-defined. The benefits of such approach is:

1. Impossible states are avoided automatically. For example:

   - Problem can occur when your data is loaded but the `error` object and `isError` flag are left unchanged from the last failed call. State machine only executes your side effect at the correct state and makes sure error is already cleared before it's executed, so such problem will not occur.
   - When you already fired a request but the user triggers another request before the previous one is resolved. You can try to avoid this by disabling the button, or adding a `isLoading` flag check before you execute the call, but this requires you to manage multiple flags as states, resetting them at the correct time and check them manually when needed. State machine elegantly solves this problem, it does not allow a `REQUEST` event on `FETCH_PENDING` state, so such request will not fire at all.

2. Simplified way to check data state:
   - you no longer need to manage multiple flags and checks like `!isLoading && !error && data !== null && <div>{data}</div>`. all you need is `matcher.success && <div>{data}</div>`.

### Visualization

To visualize the statecharts in this package, refer to the `/viz`:

```bash
yarn start
```

Then go to `http://localhost:3000/?machine=fetchDataMachine` or `http://localhost:3000/?machine=postDataMachine` to get an interactive visulization of the state charts.

### `fetchDataMachine`

![image](/uploads/ee6b3d50491a7c04a30c5a8358212f1e/image.png)

As the diagram illustrates:

- the machine starts from the `Idle` state, on `REQUEST` event it will transition to `FetchPending` state invoking `fetchData` service at the same time.
- if `fetchData` resolves, it will send `done` event transitioning the machine to `LoadFinished.LoadSucceeded` and executes the action `updateData` to update the context
- if `fetchData` fails, it will send `error` event transitioning the machine to `LoadFinished.LoadFailed` and executes the action `updateError` to update the context
- `LoadFinished` state (containing 2 sub states) allows another `REQUEST` to be sent, also executes `clearError` if it's in `LoadFailed` state

### `postDataMachine`

![image](/uploads/9d0e96b3894350b9f6e0ad3f24adaa20/image.png)

This machine is very similar to `fetchDataMachine`, but it allows `REQUEST` to be sent on `PostPending` state

- the machine starts from the `Idle` state, on `REQUEST` event it will transition to `PostPending` state invoking `postData` service at the same time.
- if `postData` resolves, it will send `done` event transitioning the machine to `PostFinished.PostSucceeded` and executes the action `updateData` to update the context
- if `postData` fails, it will send `error` event transitioning the machine to `PostFinished.PostFailed` and executes the action `updateError` to update the context
- `PostFinished` state (containing 2 sub states) allows another `REQUEST` to be sent, also executes `clearError` if it's in `LoadFailed` state
- in `PostPending` state, the machine can still take a new `REQUEST`. The old state transition and subsequent invokation and actions will not be executed at all, making sure only the later post request takes effect and updates the data
