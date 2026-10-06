export const formatJMD = (amount: number): string => {
  return `JMD $${Math.round(amount || 0).toLocaleString()}`;
};
