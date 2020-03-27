import {useMemo, useRef, useCallback} from 'react';
import {useMachine} from '@xstate/react/lib/fsm';
import makeMachine from './state-machine/requestDataMachine';

interface UseRequestHookConfig<T, V> {
  // Name is used for debugging purpose. Providing a name will turn on devtool debug
  // option in xstate
  name?: string;
  requestFn: (params?: V) => Promise<T>;
  requestOnLoading?: boolean;
}

/**
 * @typedef {Object} UseRequestReturnedObject
 * @property {any} data - xstateNode.context.data exposed for easy access to the data in the node
 * @property {any} error - xstateNode.context.error exposed for easy access to the error in the node
 * @property {object} matcher - object containing boolean values requesting, finished, success, fail for easy state maching
 * @property {function} load - exposed function for loading data
 * @property {function} matchState - exposed `xstateNode.matches` function for matching states, use StateTypes for comparison
 * @property {StateNode} xstateNode - as the name implies, the representation of the current `xstate` state https://xstate.js.org/docs/guides/states.html#state-definition. You shouldn't need access to this object but it is still exposed in case you need advanced functionality with xstate
 */

/**
 * Create hook to perform a blocking request request for data (You can't request data when a request has not been resolved or rejected).
 * @param {useRequestHookConfig} config Config file with compulsory request function `requestFn`,
 * optional `name` for debugging and
 * @returns {UseRequestReturnedObject} returnedObject
 */

const useRequest = <Item, RequestParam>(
  config: UseRequestHookConfig<Item, RequestParam>,
) => {
  const {name, requestFn, requestOnLoading} = config;
  const requestMachine = useMemo(
    () => makeMachine<Item>(requestOnLoading || false, name),
    [name],
  );

  const prevTimestampRef = useRef(new Date().valueOf());

  const [current, send] = useMachine(requestMachine, {
    actions: {
      loadData: async (ctx, event) => {
        if ('params' in event) {
          try {
            const now = new Date().valueOf();
            prevTimestampRef.current = now;
            const res = await requestFn(event.params);
            if (now === prevTimestampRef.current) {
              send({
                type: 'SUCCESS',
                data: res,
              });
            }
          } catch (err) {
            send({
              type: 'FAIL',
              data: err,
            });
          }
        }
      },
    },
  });

  // Send REQUEST event to machine with the params.
  // upon entering `pending` state, the machine will then invoke the `requestData` service
  // that actually executes the side-effect
  const load = useCallback(
    (params?: RequestParam) => {
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

  const matchState = useMemo(() => current.matches, [current.matches]);

  const matcher = useMemo(
    () => ({
      idle: matchState('Idle'),
      requesting: matchState('RequestPending'),
      finished: matchState('RequestSuccess') || matchState('RequestFail'),
      success: matchState('RequestSuccess'),
      fail: matchState('RequestFail'),
    }),
    [matchState],
  );

  return {
    data: current.context?.data,
    error: current.context?.error,
    matcher,
    load,
    reset,
    xstateNode: current,
  };
};

export default useRequest;
