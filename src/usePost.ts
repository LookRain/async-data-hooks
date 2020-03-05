import { useMemo, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import makeMachine, { StateTypes } from './state-machine/postDataMachine';

interface UsePostConfig<Req, T> {
  // Name is used for debugging purpose. Providing a name will turn on devtool debug
  // option in xstate
  name?: string;

  postFn: (data: Req) => Promise<T>;
}
/**
 *
 * @typedef {Object} UsePostReturnedObject
 * @property {any} data - xstateNode.context.responseData exposed for easy access to the POST request response data in the node
 * @property {any} error - xstateNode.context.error exposed for easy access to the error in the node
 * @property {object} matcher - object containing boolean values posting, finished, success, fail for easy state maching
 * @property {function} post - exposed function for posting data
 * @property {function} matchState - xstateNode.matches method exposed for easy state maching. Use StateTypes for matching
 * @property {StateNode} xstateNode - as the name implies, the representation of the current `xstate` state https://xstate.js.org/docs/guides/states.html#state-definition. You shouldn't need access to this object but it is still exposed in case you need advanced functionality with xstate
 */

/**
 *
 * Create hook to perform a blocking fetch request for data (You can't fetch data when a request has not been resolved or rejected).
 * @param {useGetHookConfig} config Config file with compulsory fetch function `fetchFn`,
 * optional `name` for debugging and
 * @returns {UsePostReturnedObject}
 */

const usePost = <ReqData, RespData>(
  config: UsePostConfig<ReqData, RespData>,
) => {
  const { name, postFn } = config;
  const postMachine = useMemo(() => makeMachine<ReqData, RespData>(name), [
    name,
  ]);

  const [current, send] = useMachine(postMachine, {
    devTools: !!name,
    services: {
      // This service returns the promise by calling `postFn` with the data user passed in with `post` exposed by the hook
      // The resolution and rejection logic is handled inside the xstate machine
      postData: (_, event) => {
        return postFn(event.reqData);
      },
    },
  });

  // Send REQUEST event to machine with the data.
  // upon entering `pending` state, the machine will then invoke the `post` service
  //  that actually executes the side-effect
  const post = useCallback(
    (data: ReqData) => {
      send({ type: 'REQUEST', reqData: data });
    },
    [send],
  );
  const matchState = useCallback(
    (state: StateTypes) => {
      return current.matches(state);
    },
    [current],
  );

  const matcher = useMemo(
    () => ({
      idle: matchState('Idle'),
      posting: matchState('PostPending'),
      finished: matchState('PostFinished'),
      success: matchState('PostFinished.PostSucceeded'),
      fail: matchState('PostFinished.PostFailed'),
    }),
    [matchState],
  );

  return {
    data: current.context.responseData,
    error: current.context.error,
    matcher,
    post,
    matchState,
    xstateNode: current,
  };
};

export default usePost;
