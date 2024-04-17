import type { Scope, Span, User } from '@sentry/types';
import { GLOBAL_OBJ } from '@sentry/utils';

export const WINDOW = GLOBAL_OBJ as typeof GLOBAL_OBJ & Window;

export type InteractionRouteNameMapping = Record<
  string,
  {
    routeName: string;
    duration: number;
    user?: User;
    activeSpan?: Span;
    currentScope: Scope;
    replayId?: string;
  }
>;
