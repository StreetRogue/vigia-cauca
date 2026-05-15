import { useState, useEffect } from 'react';
import type { UsuarioResponseDTO } from '../../../types/usuario.types';
import { usuariosService } from '../../../services/usuarios.service';
import styles from './UserDetailPanel.module.css';

interface Props {
  usuario: UsuarioResponseDTO | null;
  onEdit: (user: UsuarioResponseDTO) => void;
  onRefresh: () => void;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('es-CO');
}

function getInitials(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function UserDetailPanel({ usuario, onEdit, onRefresh }: Props) {
  const [toggling, setToggling] = useState(false);
  const [creadoPorNombre, setCreadoPorNombre] = useState<string | null>(null);
  const [editadoPorNombre, setEditadoPorNombre] = useState<string | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (!usuario?.creadoPor && !usuario?.editadoPor) return;

    setLoadingAudit(true);
    const promises: Promise<any>[] = [];

    if (usuario.creadoPor) {
      promises.push(
        usuariosService
          .getByIdIam(usuario.creadoPor)
          .then((u) => setCreadoPorNombre(u.nombre))
          .catch(() => setCreadoPorNombre(usuario.creadoPor))
      );
    }

    if (usuario.editadoPor) {
      promises.push(
        usuariosService
          .getByIdIam(usuario.editadoPor)
          .then((u) => setEditadoPorNombre(u.nombre))
          .catch(() => setEditadoPorNombre(usuario.editadoPor))
      );
    }

    Promise.all(promises).finally(() => setLoadingAudit(false));
  }, [usuario?.creadoPor, usuario?.editadoPor]);

  if (!usuario) {
    return (
      <div className={styles.panel}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>👤</div>
          <p className={styles.placeholderText}>Seleccione un usuario para ver el detalle</p>
        </div>
      </div>
    );
  }

  const handleToggleEstado = async () => {
    setToggling(true);
    try {
      const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
      console.log('Intentando cambiar estado:', {
        idUsuario: usuario.idUsuario,
        nuevoEstado,
        usuarioCompleto: usuario
      });
      await usuariosService.update(usuario.idUsuario, { estado: nuevoEstado });
      onRefresh();
    } catch (error: any) {
      console.error('Error al cambiar estado:', {
        error,
        response: error?.response?.data,
        message: error?.message
      });
      alert(`Error: ${error?.response?.data?.message || error?.message || 'Error al cambiar estado del usuario'}`);
    } finally {
      setToggling(false);
    }
  };

  const initials = getInitials(usuario.nombre);
  const municipioNombre = usuario.municipio?.nombre ?? '—';

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.headerInfo}>
          <p className={styles.headerTitle}>{usuario.nombre}</p>
          <p className={styles.headerSubtitle}>{usuario.email}</p>
        </div>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(usuario)}
          title="Editar usuario"
        >
          ✎
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Cédula</span>
            <span className={styles.infoValue}>{usuario.cedula}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Teléfono</span>
            <span className={styles.infoValue}>{usuario.telefono || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Usuario</span>
            <span className={styles.infoValue}>{usuario.username}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Rol</span>
            <span className={[
              styles.badge,
              usuario.rol === 'ADMIN' ? styles.adminBadge : styles.operatorBadge
            ].join(' ')}>
              {usuario.rol}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Municipio</span>
            <span className={styles.infoValue}>{municipioNombre}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Estado</span>
            <span className={[
              styles.badge,
              usuario.estado === 'ACTIVO' ? styles.activeBadge : styles.inactiveBadge
            ].join(' ')}>
              {usuario.estado}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Creado</span>
            <span className={styles.infoValue}>{formatDate(usuario.fechaCreacion)}</span>
          </div>
          {usuario.creadoPor && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Por</span>
              <span className={styles.infoValue}>{loadingAudit ? '...' : creadoPorNombre ?? usuario.creadoPor}</span>
            </div>
          )}
          {usuario.fechaActualizacion && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Actualizado</span>
              <span className={styles.infoValue}>{formatDate(usuario.fechaActualizacion)}</span>
            </div>
          )}
          {usuario.editadoPor && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Por</span>
              <span className={styles.infoValue}>{loadingAudit ? '...' : editadoPorNombre ?? usuario.editadoPor}</span>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.actionButtonsGroup}>
          <button
            className={[
              styles.actionBtn,
              usuario.estado === 'ACTIVO' ? styles.actionBtnDeactivate : styles.actionBtnActivate
            ].join(' ')}
            onClick={handleToggleEstado}
            disabled={toggling}
            title={usuario.estado === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'}
          >
            {toggling ? '...' : (usuario.estado === 'ACTIVO' ? 'Desactivar' : 'Activar')}
          </button>
        </div>
      </div>
    </div>
  );
}
