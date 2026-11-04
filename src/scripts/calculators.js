
const money = (value, digits = 2) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: digits,
  maximumFractionDigits: digits
}).format(value);

const number = (root, name) =>
  Number(root.querySelector(`[data-field="${name}"]`)?.value ?? 0);

const valid = (...values) =>
  values.every((value) => Number.isFinite(value) && value >= 0);

const hasInput = (...values) =>
  values.some((value) => value !== 0);

const unitInfo = {
  oz: { category: 'weight', factor: 1, label: 'oz' },
  lb: { category: 'weight', factor: 16, label: 'oz' },
  g: { category: 'weight', factor: 1 / 28.349523125, label: 'oz' },
  'fl oz': { category: 'volume', factor: 1, label: 'fl oz' },
  ml: { category: 'volume', factor: 1 / 29.5735295625, label: 'fl oz' },
  count: { category: 'count', factor: 1, label: 'item' }
};

function update(root) {
  const type = root.dataset.calculator;
  const result = root.querySelector('[data-result]');
  const detail = root.querySelector('[data-detail]');

  if (!result || !detail) return;

  let headline = 'Enter your numbers';
  let explanation = 'Results update as you change the values.';

  if (type === 'unit-price') {
    const a = {
      price: number(root, 'priceA'),
      qty: number(root, 'qtyA'),
      unit: root.querySelector('[data-field="unitA"]').value
    };

    const b = {
      price: number(root, 'priceB'),
      qty: number(root, 'qtyB'),
      unit: root.querySelector('[data-field="unitB"]').value
    };

    if (!valid(a.price, b.price, a.qty, b.qty)) {
      headline = 'Check your values';
      explanation = 'Enter valid numbers of zero or more.';
    } else if (a.qty === 0 || b.qty === 0) {
      if (hasInput(a.price, a.qty, b.price, b.qty)) {
        headline = 'Enter package quantities';
        explanation = 'Both package quantities must be greater than zero to compare unit prices.';
      }
    } else {
      const infoA = unitInfo[a.unit];
      const infoB = unitInfo[b.unit];

      if (!infoA || !infoB || infoA.category !== infoB.category) {
        headline = 'Units cannot be compared';
        explanation = 'Choose units from the same category: weight, volume, or items.';
      } else {
        const qtyA = a.qty * infoA.factor;
        const qtyB = b.qty * infoB.factor;
        const unitA = a.price / qtyA;
        const unitB = b.price / qtyB;
        const label = infoA.label;

        headline = Math.abs(unitA - unitB) < 0.000001
          ? 'They cost about the same'
          : `${unitA < unitB ? 'Product A' : 'Product B'} is the better value`;

        explanation =
          `Product A: ${money(unitA, 4)} per ${label}. ` +
          `Product B: ${money(unitB, 4)} per ${label}.`;

        if (Math.abs(unitA - unitB) >= 0.000001) {
          explanation +=
            ` ${unitA < unitB ? 'Product B' : 'Product A'} costs ` +
            `${money(Math.abs(unitA - unitB), 4)} more per ${label}.`;
        }
      }
    }
  }

  if (type === 'cost-per-use') {
    const price = number(root, 'price');
    const uses = number(root, 'uses');
    const extras = number(root, 'extras');

    if (!valid(price, extras, uses)) {
      headline = 'Check your values';
      explanation = 'Enter valid numbers of zero or more.';
    } else if (uses === 0) {
      if (hasInput(price, extras, uses)) {
        headline = 'Enter expected uses';
        explanation = 'Expected uses must be greater than zero.';
      }
    } else {
      const total = price + extras;
      headline = `${money(total / uses)} per use`;
      explanation = `${money(total)} estimated lifetime cost across ${new Intl.NumberFormat('en-US').format(uses)} uses.`;
    }
  }

  if (type === 'gas-cost') {
    const distance = number(root, 'distance');
    const mpg = number(root, 'mpg');
    const gasPrice = number(root, 'gasPrice');

    if (!valid(distance, gasPrice, mpg)) {
      headline = 'Check your values';
      explanation = 'Enter valid numbers of zero or more.';
    } else if (mpg === 0) {
      if (hasInput(distance, mpg, gasPrice)) {
        headline = 'Enter fuel efficiency';
        explanation = 'MPG must be greater than zero to calculate fuel cost.';
      }
    } else {
      const gallons = distance / mpg;
      headline = money(gallons * gasPrice);
      explanation = `About ${gallons.toFixed(2)} gallons for ${new Intl.NumberFormat('en-US').format(distance)} miles at ${money(gasPrice, 3)} per gallon.`;
    }
  }

  if (type === 'subscription-cost') {
    const payment = number(root, 'payment');
    const frequency = root.querySelector('[data-field="frequency"]').value;

    const annualPayments = {
      daily: 365,
      weekly: 52,
      monthly: 12,
      quarterly: 4,
      'half-yearly': 2,
      yearly: 1
    }[frequency];

    if (!valid(payment) || !annualPayments) {
      headline = 'Check your values';
      explanation = 'Enter a valid payment amount and billing frequency.';
    } else if (payment === 0) {
      headline = 'Enter your payment';
      explanation = 'Enter a payment amount greater than zero to calculate subscription costs.';
    } else {
      const annual = payment * annualPayments;

      const costs = {
        daily: annual / 365,
        weekly: annual / 52,
        monthly: annual / 12,
        quarterly: annual / 4,
        'half-yearly': annual / 2,
        yearly: annual
      };

      Object.entries(costs).forEach(([period, cost]) => {
        const output = root.querySelector(`[data-period-result="${period}"]`);
        if (output) output.textContent = money(cost);
      });

      headline = `${money(annual)} per year`;
      explanation = 'Annual subscription cost.';
    }

    if (payment === 0 || !valid(payment) || !annualPayments) {
      root.querySelectorAll('[data-period-result]').forEach((output) => {
        output.textContent = '$0.00';
      });
    }
  }

  result.textContent = headline;
  detail.textContent = explanation;
}

document.querySelectorAll('[data-calculator]').forEach((root) => {
  root.addEventListener('input', () => update(root));
  root.addEventListener('change', () => update(root));
  update(root);
});
