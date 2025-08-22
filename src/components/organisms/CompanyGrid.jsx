import React from "react";
import { motion } from "framer-motion";
import CompanyCard from "@/components/molecules/CompanyCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const CompanyGrid = ({ 
  companies, 
  companyMetrics, 
  loading, 
  error, 
  onCompanyClick, 
  onRetry 
}) => {
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={onRetry} />;
  }

  return (
    <motion.div 
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {companies.map((company) => (
        <CompanyCard
          key={company.Id}
          company={company}
          metrics={companyMetrics[company.Id]}
          onClick={onCompanyClick}
        />
      ))}
    </motion.div>
  );
};

export default CompanyGrid;