import React from 'react';

function AccountSelect(props) {
  let props2 = Object.assign({}, props);
  delete props2.accountTypes;
  delete props2.accounts;
  return (
    <select {...props2}>
      <option value="" hidden>Choose account...</option>
      {props.hasOwnProperty("accountTypes") ? props.accountTypes.map((accountType) => (
        <optgroup
          key={accountType.accountType}
          label={accountType.mask + " - " + accountType.description}
        >
        {props.accounts
          .filter(account => account.accountType == accountType.accountType)
          .map(account => (
            <option
              key={account.accountId}
              value={account.accountId}
            >
            {account.accountId} - {account.name}
            </option>
          ))}
        </optgroup>
      )) : (
        <optgroup disabled label="Loading..." className="text-muted"></optgroup>
      )}
    </select>
  );
}

export default AccountSelect;
