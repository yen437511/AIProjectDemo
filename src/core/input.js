import { toLogical } from "./scaling.js";

export function attachInput(canvas, manager) {
  const handlers = {};
  for (const [type, method] of Object.entries({
    pointerdown: "onPointerDown",
    pointermove: "onPointerMove",
    pointerup: "onPointerUp",
    pointercancel: "onPointerCancel",
  })) {
    handlers[type] = (event) => {
      if (type === "pointerdown") canvas.setPointerCapture(event.pointerId);
      manager[method]({
        ...toLogical(
          event.clientX,
          event.clientY,
          canvas.getBoundingClientRect(),
        ),
        pointerId: event.pointerId,
        buttons: event.buttons,
        pointerType: event.pointerType,
      });
      if (
        (type === "pointerup" || type === "pointercancel") &&
        canvas.hasPointerCapture(event.pointerId)
      ) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };
    canvas.addEventListener(type, handlers[type]);
  }
  return () => {
    for (const [type, handler] of Object.entries(handlers))
      canvas.removeEventListener(type, handler);
  };
}
