export function ValidationTransaction(req:any, res:any, next:any){
    const body = req.body;

    const requiredFields=['amount', 'categoryId', 'title', 'walletId']

    const missing=requiredFields.filter(f=>!body[f])

    if(missing.length>0)
        return res.status(400).json({ 
            status: false, 
            message: `Missing required fields: ${missing.join(', ')}` 
        });
    
    next();
}