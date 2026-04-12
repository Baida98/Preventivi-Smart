export function runWizard(step, data) {

  const steps = ["tipo", "mq", "qualita", "citta"];

  return steps.slice(0, step + 1).map(s => data[s]);
}
