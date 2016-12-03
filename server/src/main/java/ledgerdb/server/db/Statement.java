package ledgerdb.server.db;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Entity
public class Statement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "statement_id")
    private Integer id;
    
    @Column(name = "statement_date")
    @Temporal(TemporalType.DATE)
    @NotNull
    @JsonProperty("statement_date")
    @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd")
    private Date date;
    
    @JsonProperty("account_id")
    private int accountId; //TODO: class Account @OneToMany ???
    
    @NotNull
    private BigDecimal amount;
    
    @NotNull
    @Pattern(regexp = "^\\p{Print}{0,128}$")
    @Size(max = 128)
    private String description;
    
    @NotNull
    @Pattern(regexp = "^\\w{0,32}$")
    @Size(max = 32)
    private String source;
    
    @JsonProperty("posting_detail_id")
    private Integer postingDetailId;
    
    @Transient
    @Min(1)
    private int sequence = 1;

    public Integer getId() {
        return id;
    }

    public Date getDate() {
        return date;
    }

    public int getAccountId() {
        return accountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public String getSource() {
        return source;
    }

    public Integer getPostingDetailId() {
        return postingDetailId;
    }
    
    public int getSequence() {
        return sequence;
    }

    /*
    public void setPostingDetailId(int postingDetailId) {
        this.postingDetailId = postingDetailId;
    }
    or
    public void reconcile(int postingDetailId)
    or
    public void reconcile(PostingDetail postingDetail)
    */
    
}
