package ledgerdb.server.db;

import javax.persistence.Id;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class AccountType {

    @Id
    private Character accountType;
    
    private int mask;
    
    @NotNull
    private String description;
    
    @Min(-1)
    @Max(1)
    private byte sign;
    
}
