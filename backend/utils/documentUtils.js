// Helper function to get document type labels
const getDocumentTypeLabel = (type) => {
  const labels = {
    degree_certificate: 'Degree Certificate',
    teaching_certificate: 'Teaching Certificate',
    id_proof: 'ID Proof',
    experience_letter: 'Experience Letter',
    other: 'Other Document'
  };
  return labels[type] || type;
};

module.exports = getDocumentTypeLabel;
