import { Avatar } from '../atoms/Avatar';

interface UserCardProps {
  name: string;
  role: string;
}

export function UserCard({ name, role }: UserCardProps) {
  // Extract initials (dummy logic for now: first letter of first two words)
  const words = name.trim().split(' ');
  const initials = words.length > 1 
    ? (words[0][0] + words[1][0]).toUpperCase() 
    : name.substring(0, 2).toUpperCase();

  return (
    <div className="user-card">
      <Avatar initials={initials} />
      <div className="user-card-info">
        <span className="user-card-name">{name}</span>
        <span className="user-card-role">{role}</span>
      </div>
    </div>
  );
}
