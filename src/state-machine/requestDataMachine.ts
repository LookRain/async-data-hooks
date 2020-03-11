import {createMachine, assign} from '@xstate/fsm';

export type StateTypes =
  | 'Idle'
  | 'RequestPending'
  | 'RequestSuccess'
  | 'RequestFail';

const makeMachine = <T>(prefix?: string) => {
  type RequestDataMachineEvent =
    | {type: 'SUCCESS'; data: T}
    | {type: 'FAIL'; data: Error}
    | {type: 'REQUEST'; params?: any}
    | {type: 'RESET'};
  type RequestDataMachineContext = {
    data?: T | undefined;
    error?: Error | undefined;
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
        entry: ['clearError', 'clearData'],
      },
      RequestPending: {
        entry: ['loadData'],
        on: {
          SUCCESS: {
            target: 'RequestSuccess',
            actions: [
              assign({
                data: (_, event) =>
                  event.type === 'SUCCESS' ? event.data : (event as any).data,
              }),
            ],
          },
          FAIL: {
            target: 'RequestFail',
            actions: [
              assign({
                error: (_, event) =>
                  event.type === 'FAIL' ? event.data : (event as any).data,
              }),
            ],
          },
        },
      },

      RequestSuccess: {
        on: {
          REQUEST: 'RequestPending',
          RESET: 'Idle',
        },
        exit: [
          assign({
            data: (_, event) =>
              event.type === 'RESET' ? undefined : undefined,
          }),
        ],
      },

      RequestFail: {
        on: {
          REQUEST: 'RequestPending',
          RESET: 'Idle',
        },
        exit: [
          assign({
            data: (_, event) =>
              event.type === 'RESET' ? undefined : undefined,
          }),
        ],
      },
    },
  });
};

export default makeMachine;
