type ResultColor = 'green' | 'orange' | 'red';

export function getResultColor(field: string, value: number): ResultColor {
  const normalizedField = field.toLowerCase();

  if (normalizedField === 'glucose') {
    if (value >= 70 && value <= 99) {
      return 'green';
    }

    if ((value >= 100 && value <= 125) || (value >= 60 && value < 70)) {
      return 'orange';
    }

    return 'red';
  }

  if (normalizedField === 'systolic') {
    if (value >= 90 && value <= 120) {
      return 'green';
    }

    if (value >= 121 && value <= 139) {
      return 'orange';
    }

    return 'red';
  }

  if (normalizedField === 'diastolic') {
    if (value >= 60 && value <= 80) {
      return 'green';
    }

    if (value >= 81 && value <= 89) {
      return 'orange';
    }

    return 'red';
  }

  if (normalizedField === 'cholesterol') {
    if (value < 200) {
      return 'green';
    }

    if (value >= 200 && value <= 239) {
      return 'orange';
    }

    return 'red';
  }

  if (normalizedField === 'bmi') {
    if (value >= 18.5 && value <= 24.9) {
      return 'green';
    }

    if ((value >= 25 && value <= 29.9) || value < 18.5) {
      return 'orange';
    }

    return 'red';
  }

  return 'red';
}

export function getResultLabel(field: string, value: number): string {
  const color = getResultColor(field, value);

  if (color === 'green') {
    return 'W normie';
  }

  if (color === 'orange') {
    return 'Wartość graniczna';
  }

  return 'Poza normą';
}