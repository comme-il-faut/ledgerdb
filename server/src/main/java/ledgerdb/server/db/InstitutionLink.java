package ledgerdb.server.db;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class InstitutionLink {

    @Id
    private Integer accountId;
    public Integer getAccountId() { return accountId; }
    
    private String institution;
    public String getInstitution() { return institution; }
    
    private String reference;
    public String getReference() { return reference; }

}