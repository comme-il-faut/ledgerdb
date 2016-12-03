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
    public int getId() { return id; }
    
    @Column(name = "user_name")
    private String name;
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    @Column(name = "full_name")
    private String fullName;
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    private String pw;
    public String getPw() { return pw; }
    public void setPw(String pw) { this.pw = pw; }
}
