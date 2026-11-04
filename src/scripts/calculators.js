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

    if (!valid(a.price, b.price) || a.qty <= 0 || b.qty <= 0) {
      headline = 'Check your values';
      explanation = 'Prices must be zero or more, and quantities must be greater than zero.';
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

    if (!valid(price, extras) || !Number.isFinite(uses) || uses <= 0) {
      headline = 'Check your values';
      explanation = 'Enter costs of zero or more and at least one expected use.';
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

    if (!valid(distance, gasPrice) || !Number.isFinite(mpg) || mpg <= 0) {
      headline = 'Check your values';
      explanation = 'Distance and gas price must be zero or more; MPG must be greater than zero.';
    } else {
      const gallons = distance / mpg;
      headline = money(gallons * gasPrice);
      explanation = `About ${gallons.toFixed(2)} gallons for ${new Intl.NumberFormat('en-US').format(distance)} miles at ${money(gasPrice, 3)} per gallon.`;
    }
  }

  if (type === 'subscription-cost') {
    const payment = number(root, 'payment');
    const frequency = root.querySelector('[data-field="frequency"]').value;
    const annualPayments = { weekly: 52, monthly: 12, quarterly: 4, yearly: 1 }[frequency];

    if (!valid(payment)) {
      headline = 'Check your payment';
      explanation = 'Enter a payment amount of zero or more.';
    } else {
      const annual = payment * annualPayments;
      headline = `${money(annual)} per year`;
      explanation = `${money(annual / 12)} per month on average, billed ${frequency === 'quarterly' ? 'every three months' : frequency}.`;
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