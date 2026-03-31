const  create_transaction = {
  name: "create_transaction",
  description: `Create a new transaction. 
    Use when user wants to record a new income or sending.
    Required: title, amount, type, category_id, wallet_id, created_at.
    If category or wallet is ambiguous, ask user to clarify before calling.`,
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Transaction name, e.g. 'Ăn phở', 'Lương tháng 3'"
      },
      amount: {
        type: "number",
        description: "Amount in VND, must be positive"
      },
      type: {
        type: "string",
        enum: ["income", "sending"],
        description: "Transaction type"
      },
      category_id: {
        type: "string",
        description: "Must match an ID from the user's category list"
      },
      wallet_id: {
        type: "string",
        description: "Must match an ID from the user's wallet list"
      },
      note: {
        type: "string",
        description: "Optional extra note"
      },
      created_at: {
        type: "string",
        description: "Date in YYYY-MM-DD format. Default to today if not mentioned"
      }
    },
    required: ["title", "amount", "type", "category_id", "wallet_id", "created_at"]
  }
}

const get_transactions = {
  name: "get_transactions",
  description: `Fetch user's transactions by filter.
    Use this FIRST before calling update or delete 
    when user refers to a transaction by title instead of ID.
    Also use for analysis and summary requests.`,
  parameters: {
    type: "object",
    properties: {
      day: {
        type: "string",
        description: "Ngày cụ thể, format DD. Chỉ dùng khi lọc theo ngày cụ thể."
      },
      month: {
        type: "string",
        description: "Tháng, format MM. Dùng khi lọc theo tháng hoặc ngày cụ thể."
      },
      year: {
        type: "string",
        description: "Năm, format YYYY. Bắt buộc phải có."
      },
      keyword: {
        type: "string",
        description: "Search keyword in title or note field"
      },
      type: {
        type: "string",
        enum: ["income", "sending"],
        description: "Filter by transaction type, omit to get both"
      },
      category_id: {
        type: "string",
        description: "Filter by category, omit to get all"
      },
      wallet_id: {
        type: "string",
        description: "Filter by wallet, omit to get all"
      }
    },
    required: ["year"]
  }
}

const update_transaction={
  name: "update_transaction",
  description: `Update an existing transaction by ID.
    If user refers to transaction by title/name, 
    call get_transactions first to resolve the ID.
    Only include fields that need to be changed.`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Transaction ID, required"
      },
      title: { type: "string" },
      amount: { type: "number" },
      type: { type: "string", enum: ["income", "sending"] },
      category_id: { type: "string" },
      wallet_id: { type: "string" },
      note: { type: "string" },
      created_at: { type: "string" }
    },
    required: ["id"]
  }
}

const delete_transaction= {
  name: "delete_transaction",
  description: `Delete a transaction by ID.
    If user refers to transaction by title/name,
    call get_transactions first to resolve the ID.
    If get_transactions returns multiple results, 
    ask user to clarify which one before deleting.`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Transaction ID to delete"
      }
    },
    required: ["id"]
  }
}

const create_wallet = {
  name: "create_wallet",
  description: `Create a new wallet for the current user.
    Use when user wants to add a new wallet or account to track.
    The wallet name must be provided. 
    If balance is not mentioned, default to 0.
    Do not set user_id or status — these are handled server-side.`,
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Wallet name, e.g. 'Tiền mặt', 'Ngân hàng MB', 'Ví MoMo'"
      },
      balance: {
        type: "number",
        description: "Initial balance in VND. Default to 0 if user does not mention a specific amount. Must be non-negative."
      }
    },
    required: ["name", "balance"]
  }
}

const update_wallet = {
  name: "update_wallet",
  description: `Update wallet balance directly.
    Use when user explicitly wants to set or adjust wallet balance,
    not for normal transactions.`,
  parameters: {
    type: "object",
    properties: {
      wallet_id: {
        type: "string",
        description: "Must match an ID from user's wallet list"
      },
      balance: {
        type: "number",
        description: "New balance in VND"
      }
    },
    required: ["wallet_id", "balance"]
  }
}
const tools = [create_transaction, get_transactions, update_transaction, delete_transaction, create_wallet, update_wallet]

export default tools;