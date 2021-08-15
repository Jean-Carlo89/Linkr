import {useContext, useEffect,useState,useRef} from 'react';
import UserContext from '../UserContext';
import axios from 'axios';
import {useParams, useHistory} from 'react-router-dom';
import TrendingList from '../hashtag/TrendingList';
import styled from 'styled-components';

/*import de style components*/
import {Title,TimelineContainer,Container,TimelineContent} from '../timelineStyledComponents'
    

/*import dos Posts*/

import Posts from '../Posts'

/*InfiniteScroller*/
import InfiniteScroll from 'react-infinite-scroller';


export default function OtherUsersPosts({goToLink, openMap}){
    const {id} = useParams();
    const {user} = useContext(UserContext);
    const [usersPosts,setUsersPosts] = useState([]);
    const [serverLoading,setServerLoading] = useState(true);
    const [pageUser,setPageUser] = useState(null);
    const [userImage, setUserImage] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [olderLikes, setOlderLikes] = useState([]);
    const inputRef = useRef([]);
    const history=useHistory();
    const [disabFollow, setDisabFollow] = useState(false);
    const [followingUsers, setFollowingUsers] = useState([])


    


  /*Logics of infinite Scroller*/ 
  
  const[hasMore,setHasMore] = useState(true)

  

    const [isFollowing, setIsFollowing] = useState(false);

    const config = {
        headers:{
            'Authorization' : `Bearer ${user.token}`
        }
    } 


    useEffect(()=>{
        
        getUsersPosts()
                    
    },[id])

    function getUsersPosts(newUser){
        const getPosts = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/${newUser || id}/posts`,config)

        getPosts.then((response)=>{
          const newArray = response.data.posts
          
          setUsersPosts(newArray)

          if(response.data.posts[0]["repostedBy"]){
            setPageUser(response.data.posts[0].repostedBy.username)
            setUserImage(response.data.posts[0].repostedBy.avatar)
            }else{
                setPageUser(response.data.posts[0].user.username)
                setUserImage(response.data.posts[0].user.avatar)
            }

          setServerLoading(false) 
          let sharpedHeart = []
          newArray.forEach( post => {
              post.likes.forEach(n =>{
              if(n.userId === user.user.id){
                  sharpedHeart.push({id: post.id, likes: post.likes.length, names: post.likes.map(n => n["user.username"])})
              }})
          })
          setLikedPosts(sharpedHeart);
          setOlderLikes(sharpedHeart);
        })

        getPosts.catch((responseError)=>{
            alert(`Houve uma falha ao obter os posts. Por favor atualize a página`)
            return
        })
        
        
    }


    useEffect(() => {
        getFollowingList()
    },[])

    useEffect(() =>{
        const peopleIFollow = followingUsers && followingUsers.filter((user) => user.username === pageUser);
        peopleIFollow && peopleIFollow.length > 0 ? setIsFollowing(true) : setIsFollowing(false);
    }, [followingUsers, pageUser])

    function getFollowingList(){
        const getFollowing = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/follows", config)
        getFollowing.then((response) => setFollowingUsers(response.data.users))
        getFollowing.catch()
    }


    function goToUserPosts(id){
        if(id!==user.user.id){
            setServerLoading(true)
            getUsersPosts(id)
            history.push(`/user/${id}`)

        }
        else{
            history.push(`/my-posts`)
        }
    }

    function sendToHashtag(val){
        const newVal = val.replace('#',"")
        history.push(`/hashtag/${newVal}`)
    }

    function follow(){
        const requestToFollow = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/${id}/follow`, {}, config)
        requestToFollow.then(() => {setDisabFollow(false); getFollowingList()});
        requestToFollow.catch(()=> alert("Não foi possivel executar essa operação"));
    }

    function unfollow(){
        const requestToUnfollow = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/${id}/unfollow`, {}, config)
        requestToUnfollow.then(() => {setDisabFollow(false); getFollowingList()});
        requestToUnfollow.catch(()=> alert("Não foi possivel executar essa operação"));
    }

    function ifFollowing(){
        setDisabFollow(true);
        if(!isFollowing)
            follow() 
        else 
            unfollow()

    }


    function goToOtherUser(newUser){
        setServerLoading(true) 
        getUsersPosts(newUser)
        history.push(`/user/${newUser}`)
    }

    function scrollPage(lastPost){
        

        if(usersPosts[lastPost]===undefined){
            return
        }

      
       const getNewPosts =  axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/${id}/posts?offset=${usersPosts.length}`,config)

        getNewPosts.then((response)=>{
            
            
            if(response.data.posts.length<10){
                setHasMore(false)
            }else{
                setHasMore(true)
            }
            
            const scrollPosts = response.data.posts
            

            setUsersPosts([...usersPosts,...scrollPosts])
           
        })

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao atualizar')
        

        })

       
    }
    
    return( 
      
        <Container>
            <TimelineContainer>
                <Title>
                    <img src={userImage}/> 
                    <h1>{ !serverLoading 
                        ? `${pageUser}'s posts`  
                        :'Other Posts'}
                    </h1>
                    <Follow onClick={ifFollowing} disabled={disabFollow} following={isFollowing}>
                        <p>{!isFollowing ? "Follow" : "Unfollow"}</p>
                    </Follow>
                </Title> 
                
                <TimelineContent>

                    <InfiniteScroll
                        pageStart={0}
                        loadMore={()=>scrollPage(usersPosts.length-1)}
                        hasMore={hasMore}
                        loader={<div className="loader" key={0}>Loading More Posts...</div>}
                        threshold={1}
                        className='Scroller'
                    > 
                        
                        <Posts noPostsMessage={'Este usuário não postou nada'}
                                serverLoading={serverLoading}
                                allPosts={usersPosts}
                                olderLikes={olderLikes}
                                likedPosts={likedPosts}
                                user={user}
                                like={like}
                                inputRef={inputRef}
                                goToLink={goToLink}
                                goToUserPosts={goToUserPosts}
                                getUsersPosts={getUsersPosts}
                                sendToHashtag={sendToHashtag}
                                goToOtherUser={goToOtherUser}
                                openMap={openMap}
                                
                        />

                    </InfiniteScroll>

                   
                    
                    <TrendingList send={sendToHashtag}/>
                </TimelineContent>
            </TimelineContainer>
        </Container>

    )

    function like (id){
        const config = {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        }
        if(likedPosts.map(n => n.id).includes(id)){
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/dislike`, {}, config)
            request.then(success => {
                setLikedPosts(likedPosts.filter( (n,i) => n.id !== id))
                if(olderLikes.map(n => n.id).includes(id))
                setOlderLikes([... olderLikes.filter( (n,i) => n.id !== id), {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
        else{
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/like`, {}, config)
            request.then(success => {
                setLikedPosts([...likedPosts, {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
                if(olderLikes.map(n => n.id).includes(id)){
                    setOlderLikes([...olderLikes.filter( (n,i) => n.id !== id), {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
                }
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
    }
}


const Follow = styled.button`
    width: 112px;
    height: 30px;
    background: ${props => (!props.following ? "#1877F2" : "white" )};
    color: ${props => (props.following ? "#1877F2" : "white" )};
    border-radius: 5px;
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    font-weight: 700; 
    margin-left: 950px;
    position: absolute;

    @media (max-width:1080px){
       position: initial;
       margin-left: 0px;

    }

`;
