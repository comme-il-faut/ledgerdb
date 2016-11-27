package ledgerdb.server.db;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Integer id;
    
    private char accountType; //TODO: class AccountType
    
    private String name;
    
    private boolean cash;
    
    private boolean active;
}
