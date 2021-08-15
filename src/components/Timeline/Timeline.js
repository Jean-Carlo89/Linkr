import {useContext, useEffect,useState,useRef} from 'react';
import UserContext from '../UserContext';
import axios from 'axios';
import {useHistory} from 'react-router-dom';
import TrendingList from '../hashtag/TrendingList';
import useInterval from 'react-useinterval';

import styled from 'styled-components';


import NewPost from './NewPost'
import LinkPreview from './LinkPreview'

import getYouTubeID from 'get-youtube-id';


/*import dos Posts*/
import Posts from '../Posts'

/*import de style components*/
import {Title,TimelineContainer,Container,TimelineContent,} from '../timelineStyledComponents'

/* Import UseInterval custom hook*/
//import UseInterval from '../UseInterval'

/*InfiniteScroller*/
import InfiniteScroll from 'react-infinite-scroller';

export default function Timeline({goToLink, openMap}){
    const history = useHistory();
    const [likedPosts, setLikedPosts] = useState([]);
    const { user ,setUser} = useContext(UserContext);
    const [allPosts,setAllPosts] = useState([]);
    const [serverLoading,setServerLoading] = useState(true);
    const [olderLikes, setOlderLikes] = useState([]); 
    const inputRef = useRef([]);
    const [numberofFollowing, setNumberofFollowing] = useState([]);



    /*Logics of infinite Scroller*/ 
        
        const[hasMore,setHasMore] = useState(false)

  
    const [timelineRef,setTimelineRef] = useState(false);
    
 
    const config = {
        headers:{
            'Authorization' : `Bearer ${user.token}`
        }
    }
    
   
         
    
    function goToUserPosts(id){
        if(id!==user.user.id){
        history.push(`/user/${id}`)
        }
        else{
            history.push(`/my-posts`)
        }
    }   
    
    useEffect(()=>{

        update()        
    },[]);

    useEffect(() => {
        
        const getNumberofFollowing = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/follows", config)
        getNumberofFollowing.then((response) => setNumberofFollowing(response.data.users))
    },[])

    useInterval( () => {
        
        let postId;
        if(allPosts[0]["repostId"]){
            postId=`${allPosts[0].repostId}`
        }else{
            postId=`${allPosts[0].id}`
        }
        
        
        const getNewPosts =  axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts?earlierThan=${postId}`,config)

    
        getNewPosts.then((response)=>{
           
    
            if(response.data.posts.length===0){
                return
            }
            if(response.data.posts !== undefined){
                const datas = response.data.posts
                
                setAllPosts([...datas,...allPosts]);
            } 
         })
            

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao atualizar os posts. Por favor recarregue a página')
        })

    }, 15000); 

    function update () {
        
        const getPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts',config)
        setServerLoading(true)
        
        getPosts.then((response)=>{
            const newArray = (response.data.posts.map((p)=>({...p, toEdit: false})));
            setAllPosts(newArray)
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
            setHasMore(true)

        })

        getPosts.catch((responseError)=>{           
            alert(`Houve uma falha ao obter os posts. Por favor atualize a página`)
            return
        })

        
    }

    function sendToHashtag(val){
        const newVal = val.replace('#',"")
        history.push(`/hashtag/${newVal}`)
    }

    

    function tryingToEdit(id) {
        let postsToEdit = allPosts.map((p) => {
            if(p.id === id){
                p.toEdit = !p.toEdit;
            }
            return {...p};
        })   
        setAllPosts([...postsToEdit]);

       
    }

    
    function scrollPage(lastPost){
        if(serverLoading===true){
            return
        }

        if(allPosts[lastPost]===undefined){
            return
        }

        const getNewPosts = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts?olderThan=${allPosts[lastPost].id}`,config)

        getNewPosts.then((response)=>{
        
            if(response.data.posts.length<10){
                setHasMore(false)
            }else{
                setHasMore(true)
            }
            
             const scrollPosts = response.data.posts
         setAllPosts([...allPosts,...scrollPosts])
           
        })

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao buscas mais post. Por favor recarregue a página')
            

        })
       
    }
    return( 
        <Container>
            
            <TimelineContainer>
                <Title>
                    <h1>timeline</h1>
                  
                </Title> 
        
                    <TimelineContent>
                      
                            <NewPost update={update} />

                            {numberofFollowing.length === 0 ? <NoOneYet> Você ainda não segue ninguem, <br/> procure por perfis na busca </NoOneYet> :
                            <>
                            
                             <InfiniteScroll
                                pageStart={0}
                                loadMore={()=>scrollPage(allPosts.length-1)}
                                hasMore={hasMore}
                                loader={<div className="loader" key={0}>Loading More Posts...</div>}
                                threshold={1}
                                className='Scroller'
                            > 
                              
                                <Posts noPostsMessage={'Quem você segue ainda não publicou nenhum post'}
                                    update={update}
                                    serverLoading={serverLoading}
                                    allPosts={allPosts}
                                    goToUserPosts={goToUserPosts}
                                    olderLikes={olderLikes}
                                    likedPosts={likedPosts}
                                    user={user}
                                    like={like}
                                    tryingToEdit={tryingToEdit}
                                    config={config}
                                    inputRef={inputRef}
                                    goToLink={goToLink}
                                    sendToHashtag={sendToHashtag}
                                    openMap={openMap}                               

                                />
                                
                             </InfiniteScroll> 
                                    
                            

                            </>}

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

const NoOneYet = styled.h1`
    margin-top: 20px;
`;