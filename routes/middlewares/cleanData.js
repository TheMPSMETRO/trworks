// საშიში შინაარსის დეტექტორი
const isDangerous = (input) => {
  if (typeof input !== 'string') return false;
  
  const dangerousPatterns = [
    /<script.*?>.*?<\/script>/gi, // JavaScript კოდი
    /javascript:/gi, // JavaScript URI
    /on\w+="[^"]*"/gi, // HTML მოვლენების დამჭერები
    /<\?php.*?\?>/gi, // PHP კოდი
    /(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|--|\/\*|\*\/)/gi // SQL ინჯექცია
  ];

  return dangerousPatterns.some(pattern => pattern.test(input));
};

module.exports = isDangerous