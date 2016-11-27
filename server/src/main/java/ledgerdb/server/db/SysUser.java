package ledgerdb.server.db;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class SysUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer id;
    
    @Column(name = "user_name")
    private String name;
    
    @Column(name = "full_name")
    private String fullName;

    private String pw;
    
    public int getId() {
        return id;
    }
    
    public String getName() {
        return name;
    }
    
    public String getFullName() {
        return fullName;
    }

    public String getPw() {
        return pw;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setPw(String pw) {
        this.pw = pw;
    }
}
