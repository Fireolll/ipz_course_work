-- таблиця користувачів
create type currency as enum ('UAH', 'USD', 'EUR');
create type financial_period as enum ('month', 'quarter', 'year');
create table users (
    user_id          serial primary key,
    user_nickname    varchar(30) not null,
    email            varchar(100) not null unique,
    password_hash    varchar(255) not null,
	currency         currency not null default 'UAH',
	financial_period financial_period not null default 'month',
    created_at       timestamp not null default now(),
    updated_at       timestamp not null default now()
);

-- таблиця токенів для відновлення пароля
create table password_resets (
    id         serial primary key,
    user_id    int not null references users(user_id) on delete cascade,
    token      varchar(255) not null unique,
    used       boolean not null default false,
    expires_at timestamp not null,
    created_at timestamp not null default now()
);

-- таблиця анульованих токенів
create table blacklisted_tokens (
    id             serial primary key,
    user_id        int not null references users(user_id) on delete cascade,
    token          text not null unique,
    blacklisted_at timestamp not null default now()
);

-- enum для типу грошового потоку
create type type_of_cash_flow as enum ('income', 'expense');

-- таблиця категорій
create table categories (
    category_id       serial primary key,
    user_id           int references users(user_id) on delete cascade,
    category_name     varchar(20) not null,
    type_of_cash_flow type_of_cash_flow not null,
    is_default        boolean not null default false,
    created_at        timestamp not null default now()
);

-- таблиця фінансових рахунків
create table finance_account (
    fa_id         serial primary key,
    user_id       int not null references users(user_id) on delete cascade,
    fa_name       varchar(30) not null,
    balance       numeric(12, 2) not null default 0.00,
	currency currency not null default 'UAH',
    is_active     boolean not null default true,
    fa_created_at timestamp not null default now()
);

-- таблиця транзакцій
create table transactions (
    transaction_id   serial primary key,
    fa_id            int not null references finance_account(fa_id) on delete cascade,
    category_id      int not null references categories(category_id) on delete restrict,
    amount           numeric(12, 2) not null check (amount > 0),
    description      text,
    transaction_date timestamp not null,
    tra_created_at   timestamp not null default now()
);

-- індекси
create index idx_transactions_fa_id       on transactions(fa_id);
create index idx_transactions_category_id on transactions(category_id);
create index idx_transactions_date        on transactions(transaction_date);
create index idx_categories_user_id       on categories(user_id);
create index idx_finance_account_user_id  on finance_account(user_id);
create index idx_password_resets_token    on password_resets(token);
create index idx_blacklisted_tokens_token on blacklisted_tokens(token);