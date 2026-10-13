import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";

export function ConfirmDialog({
  abierto,
  titulo,
  descripcion,
  confirmarTexto = "Confirmar",
  cancelando = false,
  onCancelar,
  onConfirmar,
}) {
  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCancelar?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion ? (
            <DialogDescription>{descripcion}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancelar} disabled={cancelando}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar} disabled={cancelando}>
            {confirmarTexto}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
