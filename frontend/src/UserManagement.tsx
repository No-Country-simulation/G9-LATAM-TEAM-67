import { useState, useMemo, useEffect } from "react";
import {
  Search, Shield, Sun, Moon, ArrowLeft, Plus, Pencil, Power, Trash2, Eye,
  ChevronLeft, ChevronRight, X, AlertTriangle, BrainCircuit, Loader2,
} from "lucide-react";
import { useUser } from './UserContext'
import { API_URL } from "./config/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "Admin" | "User";
type Status = "Activo" | "Inactivo";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  registeredAt: string;
}

// Forma cruda que puede venir del backend (nombres de campo inciertos)
interface RawUser {
  id: number | string;
  name?: string;
  nombre?: string;
  email: string;
  role?: string;
  rol?: string;
  active?: boolean;
  enabled?: boolean;
  status?: string;
  estado?: string;
  createdAt?: string;
  registeredAt?: string;
  fechaRegistro?: string;
}

// Convierte lo que venga del backend a la forma que ya usa este componente
function normalizeUser(raw: RawUser): User {
  const rawRole = (raw.role ?? raw.rol ?? "USER").toString().toUpperCase();
  const role: Role = rawRole === "ADMIN" ? "Admin" : "User";

  let status: Status = "Activo";
  if (typeof raw.active === "boolean") status = raw.active ? "Activo" : "Inactivo";
  else if (typeof raw.enabled === "boolean") status = raw.enabled ? "Activo" : "Inactivo";
  else if (raw.status) status = raw.status.toUpperCase() === "ACTIVO" || raw.status.toUpperCase() === "ACTIVE" ? "Activo" : "Inactivo";
  else if (raw.estado) status = raw.estado.toUpperCase() === "ACTIVO" ? "Activo" : "Inactivo";

  return {
    id: String(raw.id),
    name: raw.name ?? raw.nombre ?? "Sin nombre",
    email: raw.email,
    role,
    status,
    registeredAt: raw.createdAt ?? raw.registeredAt ?? raw.fechaRegistro ?? new Date().toISOString(),
  };
}

interface ConfirmModal {
  open: boolean;
  action: "delete" | "toggle" | "edit" | "view" | null;
  user: User | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
  ["#4f46e5", "#c7d2fe"],
  ["#7c3aed", "#ddd6fe"],
  ["#0891b2", "#cffafe"],
  ["#059669", "#d1fae5"],
  ["#d97706", "#fef3c7"],
  ["#dc2626", "#fee2e2"],
];

function avatarColors(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length] as [string, string];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const [bg, fg] = avatarColors(name);
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold shrink-0"
      style={{ backgroundColor: fg, color: bg }}
    >
      {initials(name)}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  if (role === "Admin")
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: '#e7e5ff', color: '#374485' }}
      >
        <Shield size={10} />
        Admin
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      User
    </span>
  );
}
function StatusBadge({ status }: { status: Status }) {
  if (status === "Activo")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: '#d1fae5', color: 'oklch(37.8% 0.077 168.94)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'oklch(37.8% 0.077 168.94)' }} />
        Activo
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: '#fee2e2', color: '#82181a' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#82181a' }} />
      Inactivo
    </span>
  );
}

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string;
  danger?: boolean;
}

function ActionButton({ tooltip, danger, children, ...props }: ActionButtonProps) {
  return (
    <div className="relative group/tip">
      <button
        {...props}
        className={[
          "p-1.5 rounded-lg transition-colors",
          danger
            ? "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        ].join(" ")}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-foreground text-background text-xs whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
        {tooltip}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserManagement({ onGoBack }: { onGoBack: () => void }) {
  const { user: currentUser } = useUser();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [modal, setModal] = useState<ConfirmModal>({ open: false, action: null, user: null });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setLoadError(null);
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status} al cargar usuarios`);
        }
        const data: RawUser[] = await response.json();
        setUsers(data.map(normalizeUser));
      } catch (err) {
        console.error(err);
        setLoadError('No se pudieron cargar los usuarios desde el servidor.');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function openModal(action: ConfirmModal["action"], user: User) {
    setModal({ open: true, action, user });
  }

  function closeModal() {
    setModal({ open: false, action: null, user: null });
  }

  function handleConfirm() {
    if (!modal.user) return;
    if (modal.action === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== modal.user!.id));
    } else if (modal.action === "toggle") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modal.user!.id
            ? { ...u, status: u.status === "Activo" ? "Inactivo" : "Activo" }
            : u
        )
      );
    }
    closeModal();
  }

  const modalCopy = useMemo(() => {
    if (!modal.user) return { title: "", body: "", confirmLabel: "", confirmClass: "" };
    const name = modal.user.name;
    if (modal.action === "delete")
      return {
        title: "Eliminar usuario",
        body: `¿Estás seguro de que deseas eliminar a ${name}? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        confirmClass: "bg-red-600 hover:bg-red-700 text-white",
      };
    if (modal.action === "toggle")
      return {
        title: modal.user.status === "Activo" ? "Desactivar usuario" : "Activar usuario",
        body:
          modal.user.status === "Activo"
            ? `¿Desactivar la cuenta de ${name}? No podrá acceder a la plataforma.`
            : `¿Activar la cuenta de ${name}? Volverá a tener acceso a la plataforma.`,
        confirmLabel: modal.user.status === "Activo" ? "Desactivar" : "Activar",
        confirmClass: "bg-primary hover:bg-indigo-600 text-white",
      };
    if (modal.action === "edit")
      return {
        title: "Editar usuario",
        body: `La edición de ${name} estará disponible próximamente. Por ahora, esta acción es solo visual.`,
        confirmLabel: "Entendido",
        confirmClass: "bg-primary hover:bg-indigo-600 text-white",
      };
    return {
      title: "Ver detalle",
      body: `La vista de detalle de ${name} estará disponible próximamente.`,
      confirmLabel: "Entendido",
      confirmClass: "bg-primary hover:bg-indigo-600 text-white",
    };
  }, [modal]);

  return (
    <div className={dark ? "dark" : ""} style={{ fontFamily: "var(--font-sans, 'Inter', sans-serif)" }}>
      <div className="min-h-screen bg-background text-foreground">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shrink-0">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight truncate hidden sm:block">
                Clasificador Técnico - Gentión de Usuarios
              </span>
              <span className="hidden sm:block text-border">|</span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{
                  background: "linear-gradient(135deg,#4f46e520,#7c3aed20)",
                  borderColor: "#4f46e540",
                  color: "#6d28d9",
                }}
              >
                <Shield size={10} />
                Admin
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onGoBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Volver al clasificador</span>
              </button>
              <button
                onClick={() => setDark((d) => !d)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Gestión de Usuarios</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Administra los usuarios registrados en la plataforma
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95 shrink-0"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              <Plus size={15} />
              Nuevo usuario
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-shadow"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
              className="px-3 py-2 rounded-xl text-sm bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground cursor-pointer"
            >
              <option value="all">Todos los roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 rounded-xl text-sm bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {loadingUsers ? (
            <div className="rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
              <Loader2 size={28} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
              <AlertTriangle size={28} className="text-red-500" />
              <p className="text-sm font-medium text-foreground">{loadError}</p>
              <p className="text-xs text-muted-foreground">Verifica que el backend esté corriendo y que tengas permisos de administrador.</p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="hidden md:block rounded-2xl border border-border overflow-hidden bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">ID</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Correo</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Registro</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-muted-foreground">{u.id}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={u.name} />
                            <span className="font-medium text-foreground">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                        <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                        <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{formatDate(u.registeredAt)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <ActionButton tooltip="Editar" onClick={() => openModal("edit", u)}>
                              <Pencil size={14} />
                            </ActionButton>
                            <ActionButton
                              tooltip={u.status === "Activo" ? "Desactivar" : "Activar"}
                              onClick={() => openModal("toggle", u)}
                            >
                              <Power size={14} />
                            </ActionButton>
                            <ActionButton tooltip="Ver detalle" onClick={() => openModal("view", u)}>
                              <Eye size={14} />
                            </ActionButton>
                            <ActionButton tooltip="Eliminar" danger onClick={() => openModal("delete", u)}>
                              <Trash2 size={14} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {filtered.map((u) => (
                  <div key={u.id} className="rounded-2xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <p className="font-medium text-sm leading-tight">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{u.id}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <RoleBadge role={u.role} />
                      <StatusBadge status={u.status} />
                      <span className="text-xs text-muted-foreground ml-auto">{formatDate(u.registeredAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t border-border">
                      <ActionButton tooltip="Editar" onClick={() => openModal("edit", u)}>
                        <Pencil size={14} />
                      </ActionButton>
                      <ActionButton
                        tooltip={u.status === "Activo" ? "Desactivar" : "Activar"}
                        onClick={() => openModal("toggle", u)}
                      >
                        <Power size={14} />
                      </ActionButton>
                      <ActionButton tooltip="Ver detalle" onClick={() => openModal("view", u)}>
                        <Eye size={14} />
                      </ActionButton>
                      <ActionButton tooltip="Eliminar" danger onClick={() => openModal("delete", u)}>
                        <Trash2 size={14} />
                      </ActionButton>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Mostrando <span className="font-medium text-foreground">{filtered.length}</span> de{" "}
                  <span className="font-medium text-foreground">{users.length}</span> usuarios
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled
                    className="p-1.5 rounded-lg border border-border text-muted-foreground opacity-40 cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 rounded-lg border border-primary/40 text-primary text-xs font-medium">1</span>
                  <button
                    disabled
                    className="p-1.5 rounded-lg border border-border text-muted-foreground opacity-40 cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#4f46e520,#7c3aed20)" }}
              >
                <Search size={24} className="text-indigo-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">No se encontraron usuarios</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Intenta ajustar los filtros o el término de búsqueda.
                </p>
              </div>
              <button
                onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}
                className="text-sm text-primary hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </main>

        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={closeModal}
            />
            <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={[
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    modal.action === "delete"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-indigo-100 dark:bg-indigo-900/30",
                  ].join(" ")}>
                    {modal.action === "delete"
                      ? <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
                      : <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <h2 className="font-semibold text-base leading-tight">{modalCopy.title}</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {modal.user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Avatar name={modal.user.name} />
                  <div>
                    <p className="text-sm font-medium">{modal.user.name}</p>
                    <p className="text-xs text-muted-foreground">{modal.user.email}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed">{modalCopy.body}</p>

              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className={["px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95", modalCopy.confirmClass].join(" ")}
                >
                  {modalCopy.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Prueba GitHub Actions
