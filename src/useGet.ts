import { useMemo, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import makeMachine, { StateTypes } from './state-machine/fetchDataMachine';

interface UseGetHookConfig<T> {
  // Name is used for debugging purpose. Providing a name will turn on devtool debug
  // option in xstate
  name?: string;
  fetchFn: (params?: { [x: string]: any }) => Promise<T>;
}

/**
 * @typedef {Object} UseGetReturnedObject
 * @property {any} data - xstateNode.context.data exposed for easy access to the data in the node
 * @property {any} error - xstateNode.context.error exposed for easy access to the error in the node
 * @property {object} matcher - object containing boolean values fetching, finished, success, fail for easy state maching
 * @property {function} load - exposed function for loading data
 * @property {function} matchState - exposed `xstateNode.matches` function for matching states, use StateTypes for comparison
 * @property {StateNode} xstateNode - as the name implies, the representation of the current `xstate` state https://xstate.js.org/docs/guides/states.html#state-definition. You shouldn't need access to this object but it is still exposed in case you need advanced functionality with xstate
 */

/**
 * Create hook to perform a blocking fetch request for data (You can't fetch data when a request has not been resolved or rejected).
 * @param {useGetHookConfig} config Config file with compulsory fetch function `fetchFn`,
 * optional `name` for debugging and
 * @returns {UseGetReturnedObject} returnedObject
 */

const useGet = <Item>(config: UseGetHookConfig<Item>) => {
  const { name, fetchFn } = config;
  const fetchMachine = useMemo(() => makeMachine<Item>(name), [name]);

  const [current, send] = useMachine(fetchMachine, {
    devTools: !!name,
    services: {
      // This service returns the promise by calling `fetchFn` with the params user passed in with `load` exposed by the hook
      // The resolution and rejection logic is handled inside the xstate machine
      fetchData: (_, event) => {
        const { params } = event;
        return fetchFn(params);
      },
    },
  });

  // Send REQUEST event to machine with the params.
  // upon entering `pending` state, the machine will then invoke the `fetchData` service
  // that actually executes the side-effect
  const load = useCallback(
    (params?: { [x: string]: any }) => {
      send({
        type: 'REQUEST',
        params,
      });
    },
    [send],
  );

  const reset = useCallback(() => {
    send({
      type: 'RESET',
    });
  }, [send]);

  const matchState = useCallback(
    (state: StateTypes) => {
      return current.matches(state);
    },
    [current],
  );

  const matcher = useMemo(
    () => ({
      idle: matchState('Idle'),
      fetching: matchState('FetchPending'),
      finished: matchState('LoadFinished'),
      success: matchState('LoadFinished.LoadSucceeded'),
      fail: matchState('LoadFinished.LoadFailed'),
    }),
    [matchState],
  );

  return {
    data: current.context.data,
    error: current.context.error,
    matcher,
    load,
    reset,
    matchState,
    xstateNode: current,
  };
};

export default useGet;
