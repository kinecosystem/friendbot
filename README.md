# Friendbot Server for the Kin Testnet Network

An alternative [friendbot](https://github.com/kinecosystem/go/tree/master/services/friendbot) implementation using the [kin-sdk-node](https://github.com/kinecosystem/kin-sdk-node).

The service exposes 2 endpoints:
* Creating an account with a desired starting kin balance.
* Funding existing an account with a desired kin amount.

### Funding an account

`GET SERVICE_URL/fund?addr=<public adderss>&amount=<starting kin balance>`

`addr` - required, the public address of the account to create.  
`amount` - optional, the starting balance of the newly created account.

Result:
```json
{
  "hash":"b13c232bdc4f070061f6b1722a69ef13670c510fe51051b4d9db23ce3a9ee82f",
}
```

The result response will include the hash of the transaction used to create the account.

### Creating an account

`GET SERVICE_URL?addr=<public adderss>&amount=<starting kin balance>`

`addr` - required, the public address of an existing account to fund.  
`amount` - required, the amount of kin to fund.

Result:
```json
{
  "hash":"b13c232bdc4f070061f6b1722a69ef13670c510fe51051b4d9db23ce3a9ee82f",
}
```

The result response will include the hash of the transaction used to fund the account.

## Install

Clone the repo

`git clone https://github.com/kinecosystem/friendbot.git`

Install the repo
  
`npm install`

Build
  
`npm run build`

Run

`npm run start`

## Configuration

The service must be configured before running, configure by changing the [config/default.json](config/default.json).

The most important of which are the:

* `base_seed`: the root account seed, which is used to fund and create account. this account must be created and well funded beforehand.
* `channels_salt`: the salt that used for deterministically create friendbot channels, channels are required for handling multiple requests concurrently.
* `channels_count`: channels count, determines the service parallelism level.
* `starting_balance`: channels starting balance.

