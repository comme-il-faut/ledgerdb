package ledgerdb.server.db;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class InstitutionLink {

    @Id
    @JsonProperty("account_id")
    private Integer accountId;
    
    private String institution;
    
    private String reference;

    public Integer getAccountId() {
        return accountId;
    }

    public String getInstitution() {
        return institution;
    }

    public String getReference() {
        return reference;
    }
    
}
