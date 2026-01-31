interface StudentPageProps {
  params: Promise<{
    usn: string;
  }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
  const { usn } = await params;

  return (
    <div>
      <h1>Student USN: {usn}</h1>
    </div>
  );
}
