import * as A from "./action";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";
import { StatusCA, mkStatusCA } from "./status";

export const effect1: StatusCA = mkStatusCA({
  condition: new C.And(C.mkIsTag("EndTurn"), new C.HasTarget(new T.Self())),
  actions: [
    new A.Cost(new V.Constant(5), "sie", new T.Self()),
    new A.Regen(new V.Constant(20), "tah", new T.Self()),
  ],
});