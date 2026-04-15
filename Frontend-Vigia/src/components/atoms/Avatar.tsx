interface AvatarProps {
  initials: string;
}

export function Avatar({ initials }: AvatarProps) {
  return (
    <div className="avatar">
      <span className="avatar-text">{initials}</span>
    </div>
  );
}
