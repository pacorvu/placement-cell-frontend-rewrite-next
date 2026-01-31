export default async function RegistrationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return <div>Drive Registration Page where id is {id}</div>;
}
