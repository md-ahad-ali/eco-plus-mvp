interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default PageHeader;