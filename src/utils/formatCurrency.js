/**
 * Formats a number as Indian Currency (INR)
 * e.g. 150000 -> "₹1,50,000"
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const num = Math.round(Number(amount));
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Indian numbering format: last 3 digits, then groups of 2
  const numStr = absNum.toString();
  let result = '';

  if (numStr.length <= 3) {
    result = numStr;
  } else {
    const lastThree = numStr.substring(numStr.length - 3);
    const rest = numStr.substring(0, numStr.length - 3);
    
    // Add commas every 2 digits from right to left
    let formattedRest = '';
    for (let i = rest.length; i > 0; i -= 2) {
      const start = Math.max(0, i - 2);
      const chunk = rest.substring(start, i);
      formattedRest = chunk + (formattedRest ? ',' + formattedRest : '');
    }
    
    result = formattedRest + ',' + lastThree;
  }

  return (isNegative ? '-₹' : '₹') + result;
}

/**
 * Formats file size in readable format
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

