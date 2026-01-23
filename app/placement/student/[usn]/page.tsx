interface StudentPageProps {
  params: {
    usn: string;
  };
}

export default function StudentPage({ params }: StudentPageProps) {
  const { usn } = params;

  return (
    <div>
      <h1>Student USN: {usn}</h1>
    </div>
  );
}
