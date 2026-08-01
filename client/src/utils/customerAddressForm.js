export function createAddressFormState(address = null) {
  return {
    label: address?.label ?? "",
    recipientName: address?.recipientName ?? "",
    phone: address?.phone ?? "",
    governorate: address?.governorate ?? "",
    city: address?.city ?? "",
    street: address?.street ?? "",
    building: address?.building ?? "",
    floor: address?.floor ?? "",
    landmark: address?.landmark ?? "",
    notes: address?.notes ?? "",
    isDefault: address?.isDefault ?? false,
  };
}

export function validateAddressForm(form) {
  const requiredFields = [
    ["label", "Address label"],
    ["recipientName", "Recipient name"],
    ["phone", "Phone number"],
    ["governorate", "Governorate"],
    ["city", "City"],
    ["street", "Street"],
  ];

  for (const [field, label] of requiredFields) {
    if (!form[field].trim()) {
      return `${label} is required.`;
    }
  }

  return null;
}

function optionalText(value) {
  const normalizedValue = value.trim();

  return normalizedValue || null;
}

export function buildAddressPayload(form, includeDefault = true) {
  return {
    label: form.label.trim(),
    recipientName: form.recipientName.trim(),
    phone: form.phone.trim(),
    governorate: form.governorate.trim(),
    city: form.city.trim(),
    street: form.street.trim(),
    building: optionalText(form.building),
    floor: optionalText(form.floor),
    landmark: optionalText(form.landmark),
    notes: optionalText(form.notes),

    ...(includeDefault
      ? {
          isDefault: form.isDefault,
        }
      : {}),
  };
}
