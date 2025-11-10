import { useParams, useNavigate } from 'react-router-dom';
import { DepartmentDetail } from '@/components/departments/department-detail-enhanced';

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Departamento no encontrado</p>
      </div>
    );
  }

  return (
    <DepartmentDetail 
      departamentoId={id} 
      onBack={() => navigate('/departamentos')} 
    />
  );
}
