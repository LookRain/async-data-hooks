import {createMachine, assign} from '@xstate/fsm';

export type StateTypes =
  | 'Idle'
  | 'RequestPending'
  | 'RequestSuccess'
  | 'RequestFail';

const makeMachine = <T>(requestOnLoading: boolean, prefix?: string) => {
  type RequestDataMachineEvent =
    | {type: 'SUCCESS'; data: T}
    | {type: 'FAIL'; data: Error}
    | {type: 'REQUEST'; params?: any}
    | {type: 'RESET'};
  type RequestDataMachineContext = {
    data?: T | undefined;
    error?: Error | undefined;
    timestamp?: number | undefined;
  };
  type RequestDataMachineState =
    | {
        value: 'Idle';
        context: {
          data: undefined;
          error: undefined;
        };
      }
    | {
        value: 'RequestPending';
        context: {
          data: undefined;
          error: undefined;
        };
      }
    | {
        value: 'RequestSuccess';
        context: {
          data: T;
          error: undefined;
        };
      }
    | {
        value: 'RequestFail';
        context: {
          data: undefined;
          error: Error;
        };
      };

  const setData = assign({
    data: (
      _,
      event: {
        type: 'SUCCESS';
        data: T;
      },
    ) => (event.type === 'SUCCESS' ? event.data : (event as any).data),
  });

  const setError = assign({
    error: (
      _,
      event: {
        type: 'FAIL';
        data: Error;
      },
    ) => (event.type === 'FAIL' ? event.data : (event as any).data),
  });
  return createMachine<
    RequestDataMachineContext,
    RequestDataMachineEvent,
    RequestDataMachineState
  >({
    id: prefix,
    initial: 'Idle',
    states: {
      Idle: {
        on: {
          REQUEST: 'RequestPending',
        },
        entry: [
          assign({
            data: (_, event) =>
              event.type === 'RESET' ? undefined : undefined,
          }),
          assign({
            data: (_, event) =>
              event.type === 'RESET' ? undefined : undefined,
          }),
        ],
      },
      RequestPending: {
        entry: ['loadData'],
        on: {
          SUCCESS: {
            target: 'RequestSuccess',
            actions: [setData],
          },
          FAIL: {
            target: 'RequestFail',
            actions: [setError],
          },
          REQUEST: requestOnLoading
            ? {
                target: 'RequestPending',
              }
            : '',
        },
      },

      RequestSuccess: {
        on: {
          REQUEST: 'RequestPending',
          RESET: 'Idle',
          SUCCESS: requestOnLoading
            ? {
                target: 'RequestSuccess',
                actions: [setData],
              }
            : '',
        },
      },

      RequestFail: {
        on: {
          REQUEST: 'RequestPending',
          RESET: 'Idle',
          FAIL: requestOnLoading
            ? {
                target: 'RequestFail',
                actions: [setError],
              }
            : '',
        },
      },
    },
  });
};

export default makeMachine;
